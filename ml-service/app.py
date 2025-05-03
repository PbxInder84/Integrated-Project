"""
Production-ready Resume Analyzer ML Service.
"""

import os
import logging
import time
import uuid
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix
from prometheus_client import make_wsgi_app, Counter, Histogram
from werkzeug.middleware.dispatcher import DispatcherMiddleware

# Import configuration
from config import config

# Initialize logging
logging.basicConfig(
    level=config.LOG_LEVEL,
    format=config.LOG_FORMAT,
    handlers=[
        logging.FileHandler(config.LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Import modules from restructured files
from utils.text_extraction import extract_text_from_file
from utils.resume_parser import extract_resume_info
from utils.resume_scorer import score_resume
import tensorflow_model

# Prometheus metrics
REQUEST_COUNT = Counter('resume_analyzer_requests_total', 'Total request count')
REQUEST_LATENCY = Histogram('resume_analyzer_request_latency_seconds', 'Request latency in seconds')
FILE_SIZE = Histogram('resume_analyzer_file_size_bytes', 'Size of uploaded files in bytes')
ERROR_COUNT = Counter('resume_analyzer_errors_total', 'Total error count', ['status_code'])

# Initialize Flask application
app = Flask(__name__)
app.config.from_object(config)
app.wsgi_app = ProxyFix(app.wsgi_app)

# Add Prometheus WSGI middleware to route /metrics requests
app.wsgi_app = DispatcherMiddleware(app.wsgi_app, {
    '/metrics': make_wsgi_app()
})

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": config.CORS_ORIGINS,
        "methods": ["POST", "OPTIONS", "GET"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Helper functions
def allowed_file(filename):
    """Check if file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in config.ALLOWED_EXTENSIONS

@app.errorhandler(400)
def bad_request(error):
    ERROR_COUNT.labels(status_code=400).inc()
    return jsonify({"error": str(error.description)}), 400

@app.errorhandler(404)
def not_found(error):
    ERROR_COUNT.labels(status_code=404).inc()
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    ERROR_COUNT.labels(status_code=405).inc()
    return jsonify({"error": "Method not allowed"}), 405

@app.errorhandler(413)
def request_entity_too_large(error):
    ERROR_COUNT.labels(status_code=413).inc()
    return jsonify({"error": "File too large. Maximum size is {} MB".format(app.config['MAX_CONTENT_LENGTH'] / 1024 / 1024)}), 413

@app.errorhandler(500)
def internal_server_error(error):
    ERROR_COUNT.labels(status_code=500).inc()
    logger.error(f"Internal server error: {str(error)}", exc_info=True)
    return jsonify({"error": "Internal server error. Please try again later."}), 500

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    """
    Analyze a resume file by extracting information and providing a score.
    
    Returns:
        JSON with extracted information, scores, and feedback
    """
    # Start request timer
    start_time = time.time()
    REQUEST_COUNT.inc()
    
    try:
        # Check if file is present
        if 'file' not in request.files:
            logger.warning("No file part in the request")
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        if file.filename == '':
            logger.warning("No file selected")
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            logger.warning(f"Unsupported file format: {file.filename}")
            return jsonify({"error": "Unsupported file format. Please upload PDF, DOC, DOCX, or TXT"}), 400
        
        # Track file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        FILE_SIZE.observe(file_size)
        
        # Generate a secure unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        logger.info(f"Saving file to {file_path}")
        file.save(file_path)
        
        try:
            # Extract text from the file
            text = extract_text_from_file(file_path)
            
            if not text or len(text) < 50:
                logger.warning(f"Could not extract meaningful text from the file: {file_path}")
                return jsonify({"error": "Could not extract text from the file. Please check if the file is valid and not empty."}), 400
            
            # Extract information from the text
            logger.info(f"Extracting information from text of length {len(text)}")
            extracted_info = extract_resume_info(text)
            
            # Score the resume
            scoring_result = score_resume(extracted_info, text)
            
            # Add TensorFlow model enhancement (40% traditional score, 60% AI model)
            ai_score = tensorflow_model.analyze_resume(extracted_info)
            
            # Blend the scores
            traditional_score = scoring_result["score"]
            blended_score = int(0.4 * traditional_score + 0.6 * ai_score)
            
            # Update the score in the results
            scoring_result["score"] = blended_score
            scoring_result["ai_score"] = ai_score
            scoring_result["traditional_score"] = traditional_score
            
            # Combine results
            result = {
                **extracted_info,
                "score": scoring_result["score"],
                "feedback": scoring_result["feedback"],
                "category_scores": scoring_result.get("category_scores", []),
                "processing_time": f"{time.time() - start_time:.2f} seconds",
                "service_version": config.VERSION
            }
            
            # Record latency
            REQUEST_LATENCY.observe(time.time() - start_time)
            logger.info(f"Analysis completed in {time.time() - start_time:.2f} seconds")
            
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"Error processing file: {str(e)}", exc_info=True)
            ERROR_COUNT.labels(status_code=500).inc()
            return jsonify({"error": f"Error processing file: {str(e)}"}), 500
        finally:
            # Clean up the file after processing
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Removed temporary file: {file_path}")
            except Exception as e:
                logger.error(f"Error removing temporary file: {str(e)}")
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        ERROR_COUNT.labels(status_code=500).inc()
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for the service"""
    return jsonify({
        "status": "healthy", 
        "service": config.APP_NAME,
        "version": config.VERSION,
        "environment": config.ENV,
        "timestamp": time.time()
    })

@app.route('/config', methods=['GET'])
def get_public_config():
    """Return public configuration of the service"""
    if config.ENV == 'production':
        # In production, return minimal configuration
        return jsonify({
            "service": config.APP_NAME,
            "version": config.VERSION,
            "allowed_extensions": list(config.ALLOWED_EXTENSIONS),
            "max_file_size_mb": config.MAX_CONTENT_LENGTH / (1024 * 1024)
        })
    else:
        # In development, return more information
        return jsonify({
            "service": config.APP_NAME,
            "version": config.VERSION,
            "environment": config.ENV,
            "debug": config.DEBUG,
            "allowed_extensions": list(config.ALLOWED_EXTENSIONS),
            "max_file_size_mb": config.MAX_CONTENT_LENGTH / (1024 * 1024),
            "tensorflow_enabled": config.USE_TENSORFLOW,
            "advanced_model_enabled": config.USE_ADVANCED_MODEL
        })

@app.route('/resumes/<resume_id>/recommendations', methods=['GET'])
def get_recommendations(resume_id):
    try:
        # In a real implementation, you'd load the resume data from a database
        # For now, we'll simulate this with sample data
        
        # Fetch the resume data (simplified example)
        resume_data = get_resume_data(resume_id)
        
        if not resume_data:
            return jsonify({"error": "Resume not found"}), 404
        
        # Generate recommendations based on resume content
        recommendations = generate_recommendations(resume_data)
        
        return jsonify(recommendations)
    
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/improve-text', methods=['POST'])
def improve_text():
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
            
        text = data['text']
        text_type = data.get('type', 'bullet_point')
        context = data.get('context', {})
        
        # In a production environment, this would call an LLM like GPT
        improved_text = enhance_text_with_ai(text, text_type, context)
        
        return jsonify({'improved_text': improved_text})
    
    except Exception as e:
        logger.error(f"Error improving text: {str(e)}")
        return jsonify({'error': str(e)}), 500

def get_resume_data(resume_id):
    # In a real implementation, you would query a database
    # For this example, we'll return dummy data
    return {
        "id": resume_id,
        "name": "John Doe",
        "experience": [
            {
                "title": "Software Engineer",
                "company": "Tech Solutions Inc.",
                "dates": "2019-2022",
                "bullets": [
                    "Developed web applications using React and Node.js",
                    "Worked on database optimization",
                    "Participated in code reviews and pair programming"
                ]
            }
        ],
        "skills": ["JavaScript", "React", "Node.js", "Python", "SQL"],
        "education": [
            {
                "degree": "Bachelor of Science in Computer Science",
                "institution": "University of Technology",
                "year": "2019"
            }
        ]
    }

def generate_recommendations(resume_data):
    """Generate personalized recommendations based on resume content."""
    # In a production environment, this would use a more sophisticated analysis
    # potentially with ML models trained on successful resumes
    
    recommendations = {
        "weakAreas": [],
        "keywords": []
    }
    
    # Experience recommendations
    experience_recs = []
    if resume_data.get("experience"):
        # Check for action verbs
        has_action_verbs = False
        has_metrics = False
        
        for exp in resume_data["experience"]:
            for bullet in exp.get("bullets", []):
                words = bullet.lower().split()
                if any(word in ["developed", "created", "managed", "led", "implemented", "designed"] for word in words):
                    has_action_verbs = True
                if any(char.isdigit() for char in bullet) or "%" in bullet:
                    has_metrics = True
        
        if not has_action_verbs:
            experience_recs.append("Use more action verbs at the beginning of bullet points")
        if not has_metrics:
            experience_recs.append("Include quantifiable achievements (e.g., increased sales by 20%)")
        
        experience_recs.append("Match keywords from the job descriptions you're targeting")
        
        recommendations["weakAreas"].append({
            "area": "experience",
            "recommendations": experience_recs
        })
    
    # Skills recommendations
    skills = resume_data.get("skills", [])
    if skills:
        skills_recs = []
        if len(skills) < 8:
            skills_recs.append("Add more technical skills relevant to your industry")
        
        skills_recs.append("Organize skills by categories (technical, soft, domain)")
        skills_recs.append("Remove outdated or irrelevant skills")
        
        recommendations["weakAreas"].append({
            "area": "skills",
            "recommendations": skills_recs
        })
    
    # Education recommendations
    education = resume_data.get("education", [])
    if education:
        edu_recs = []
        edu_recs.append("List relevant coursework that aligns with your target role")
        edu_recs.append("Include GPA if it's above 3.5")
        edu_recs.append("Mention academic projects or research work")
        
        recommendations["weakAreas"].append({
            "area": "education",
            "recommendations": edu_recs
        })
    
    # Add summary recommendations
    recommendations["weakAreas"].append({
        "area": "summary",
        "recommendations": [
            "Keep your summary concise (3-5 sentences)",
            "Highlight your most impressive achievements",
            "Include your years of experience and specialization"
        ]
    })
    
    # Industry-specific keywords
    industry_keywords = [
        "data analysis",
        "project management",
        "stakeholder communication",
        "agile methodology",
        "cross-functional collaboration",
        "problem-solving",
        "full-stack development",
        "CI/CD",
        "system architecture",
        "cloud infrastructure"
    ]
    
    recommendations["keywords"] = industry_keywords
    
    return recommendations

def enhance_text_with_ai(text, text_type, context):
    """Enhance text using AI (simulated for this example)."""
    # In production, this would call an LLM API
    
    # For demo purposes, we'll use some predefined improvements
    if text_type == "bullet_point":
        improved_texts = {
            "Managed a team of developers": "Led a cross-functional team of 8 developers, resulting in successful delivery of 5 key projects ahead of schedule and 15% under budget",
            "Worked on database optimization": "Optimized database performance by redesigning query structures, reducing response time by 40% and improving user experience for 10,000+ daily users",
            "Helped with customer service issues": "Resolved 95% of complex customer service issues within 24 hours, increasing customer satisfaction scores from 3.7 to 4.8/5.0",
            "Created reports": "Developed automated reporting system that consolidated data from 5 sources, saving 15 hours weekly and improving decision-making accuracy by 30%",
            "Participated in project planning": "Spearheaded project planning initiatives that streamlined workflow processes, resulting in 25% reduction in project delivery timelines"
        }
        
        # Try to match the input text to our predefined examples
        for key, value in improved_texts.items():
            if text.lower() in key.lower() or key.lower() in text.lower():
                return value
        
        # Default improvement for unmatched text
        return text.replace("Responsible for", "Led and executed").replace("Worked on", "Delivered").replace("Helped with", "Streamlined")
    
    return text

# Gunicorn entry point
if __name__ == '__main__':
    logger.info(f"Starting {config.APP_NAME} v{config.VERSION} in {config.ENV} mode")
    
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    
    app.run(host=host, port=port, debug=config.DEBUG) 