import json
import re
from nltk.tokenize import word_tokenize

# Load predefined skills
with open("data/skills.json", "r") as f:
    skills_list = json.load(f)

def extract_skills(text):
    """Extract skills from resume text."""
    words = word_tokenize(text.lower())
    return list(set([word for word in words if word in skills_list]))

def extract_experience(text):
    """Extract years of experience from resume text."""
    exp_match = re.search(r'(\d+)\s*(years|yrs)\s*(experience)', text.lower())
    return int(exp_match.group(1)) if exp_match else 0
