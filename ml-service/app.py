from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import time
import uuid
from werkzeug.utils import secure_filename

# Initialize logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import modules from restructured files
from utils.text_extraction import extract_text_from_file
from utils.resume_parser import extract_resume_info
from utils.resume_scorer import score_resume

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    try:
        start_time = time.time()
        
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
            return jsonify({"error": "Unsupported file format. Please upload PDF, DOC, or DOCX"}), 400
        
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
            
            # Combine results
            result = {
                **extracted_info,
                "score": scoring_result["score"],
                "feedback": scoring_result["feedback"],
                "processing_time": f"{time.time() - start_time:.2f} seconds"
            }
            
            logger.info(f"Analysis completed in {time.time() - start_time:.2f} seconds")
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"Error processing file: {str(e)}", exc_info=True)
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
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "service": "resume-analyzer-ml",
        "version": "2.0.0",
        "timestamp": time.time()
    })

if __name__ == '__main__':
    logger.info("Starting Resume Analyzer ML Service")
    app.run(host='0.0.0.0', port=5000, debug=True) 