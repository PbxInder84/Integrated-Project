import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

# Load dataset
df = pd.read_csv("data/training_data.csv")

# Features & target
X = df[['skills_count', 'experience_years']]
y = df['ats_score']

# Train ML model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = LogisticRegression()
model.fit(X_train, y_train)

# Save trained model
joblib.dump(model, "model/model.pkl")
print("Model trained & saved successfully!")
