import joblib
import numpy as np
import os

# Load trained ML model
model_path = "model/model.pkl"
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found at {model_path}. Please train the model first.")

model = joblib.load(model_path)

def predict_ats_score(features):
    """Predict ATS score using ML model."""
    try:
        features_array = np.array(features).reshape(1, -1)
        score = model.predict_proba(features_array)[0][1] * 100
        return round(score, 2)
    except Exception as e:
        return f"Error predicting ATS score: {str(e)}"
