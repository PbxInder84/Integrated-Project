from flask import Flask, request, jsonify
from model.resume_parser import extract_text
from model.feature_extractor import extract_skills, extract_experience
from model.ats_scorer import predict_ats_score
import os
from utils.logger import log_message

app = Flask(__name__)
app.run(port=5001, debug=True)

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    """Analyzes a resume file and returns ATS score."""
    if 'resume' not in request.files:
        log_message("No file uploaded")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['resume']
    text = extract_text(file)
    log_message(f"Extracted text from {file.filename}")

    skills = extract_skills(text)
    experience = extract_experience(text)

    features = [len(skills), experience]
    score = predict_ats_score(features)

    return jsonify({
        "score": score,
        "skills": skills,
        "experience": experience
    })

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
    app.run(port=5001, debug=True)
