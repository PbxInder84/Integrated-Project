from fastapi import HTTPException
import joblib
import numpy as np
import os

# Load trained ML model
model_path = "model/model.pkl"
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found at {model_path}. Please train the model first.")

model = joblib.load(model_path)

def predict_ats_score(features):
    """Predict ATS score and generate feedback."""
    try:
        skills_count, experience = features
        
        # Base score calculation with more nuanced approach
        # Skills worth 60% max with diminishing returns after 10 skills
        if skills_count <= 10:
            skill_score = skills_count * 6
        else:
            skill_score = 60 + min((skills_count - 10) * 2, 10)  # Extra points for >10 skills, max 10 bonus
            
        # Experience worth 40% max with graduated scale
        if experience == 0:
            exp_score = 0
        elif experience < 2:
            exp_score = experience * 10  # 0-20 points
        elif experience < 5:
            exp_score = 20 + (experience - 2) * 5  # 20-35 points
        else:
            exp_score = 35 + min((experience - 5) * 1, 5)  # 35-40 points
            
        # Calculate final score (cap at 100)
        final_score = min(skill_score + exp_score, 100)
        
        # Generate detailed feedback
        feedback = []
        
        # Skills feedback
        if skills_count >= 15:
            feedback.append("Exceptional technical skill diversity")
        elif skills_count >= 12:
            feedback.append("Excellent technical skill set")
        elif skills_count >= 8:
            feedback.append("Strong technical background")
        elif skills_count >= 5:
            feedback.append("Good range of technical skills")
        else:
            feedback.append("Consider adding more technical skills")
            
        # Experience feedback
        if experience == 0:
            feedback.append("Include your work experience duration clearly")
        elif experience < 2:
            feedback.append("Entry level position")
        elif experience < 5:
            feedback.append("Mid-level experience")
        else:
            feedback.append("Senior level experience")
            
        # Project feedback (based on skills)
        if skills_count >= 12:
            feedback.append("Impressive project portfolio demonstrating diverse skill application")
        elif skills_count >= 8:
            feedback.append("Project experience demonstrates good skill application")
        
        return {
            "score": round(final_score, 2),
            "status": "success",
            "feedback": ". ".join(feedback)
        }
        
    except Exception as e:
        print(f"Error in ATS scoring: {str(e)}")
        return {"score": 0, "status": "error", "feedback": "Error in scoring"}