from flask import Flask, request, jsonify
from model.resume_parser import extract_text
from model.feature_extractor import extract_skills, extract_experience
from model.ats_scorer import predict_ats_score
import os
from utils.logger import log_message
from flask_cors import CORS
import nltk

# Initialize NLTK resources
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    nltk.download('averaged_perceptron_tagger')
    nltk.download('maxent_ne_chunker')
    nltk.download('words')
    nltk.download('stopwords')

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    """Analyzes a resume file and returns ATS score."""
    try:
        if 'resume' not in request.files:
            log_message("No file uploaded")
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['resume']
        if not file.filename:
            return jsonify({"error": "Empty file"}), 400

        # Log file details
        log_message(f"Received file: {file.filename}")
        
        # Extract text
        text = extract_text(file)
        if not text:
            return jsonify({"error": "Could not extract text from file"}), 400
        log_message(f"Extracted text length: {len(text)}")

        # Extract features
        skills = extract_skills(text)
        experience = extract_experience(text)
        log_message(f"Extracted skills: {len(skills)}, experience: {experience}")

        # Calculate score with feedback
        result = predict_ats_score([len(skills), experience])
        
        return jsonify({
            "score": result["score"],
            "feedback": result["feedback"],
            "skills": skills,
            "experience": experience,
            "status": "success"
        })
    except Exception as e:
        log_message(f"Error in analyze_resume: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/models/status', methods=['GET'])
def model_status():
    """Returns the model's status."""
    return jsonify({
        "status": "Model is active",
        "version": "1.0.3"
    })

@app.route('/train', methods=['POST'])
def train_model():
    """Triggers ML model training."""
    os.system("python train_model.py")
    return jsonify({"message": "Training started", "status": "In Progress"})

if __name__ == '__main__':
    log_message("Starting ML service...")
    app.run(host='0.0.0.0', port=5001, debug=True)
