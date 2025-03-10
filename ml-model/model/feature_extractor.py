import json
import re
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
import nltk

def extract_skills(text):
    """Extract skills from resume text."""
    try:
        print(f"\nProcessing text: {text[:200]}...")
        
        # Convert text to lowercase and split into words
        words = text.lower().split()
        print(f"Total words found: {len(words)}")
        
        # Clean and normalize words
        words = [re.sub(r'[^\w\s\.]', '', word) for word in words]
        words = [word for word in words if word]
        
        # Get word pairs and triplets for compound skills
        word_pairs = [words[i] + ' ' + words[i+1] for i in range(len(words)-1)]
        word_triplets = [words[i] + ' ' + words[i+1] + ' ' + words[i+2] 
                        for i in range(len(words)-2)]
        
        # Load skills from JSON
        with open("data/skills.json", "r") as f:
            skills_data = json.load(f)
        
        # Create skills set with variations
        all_skills = set()
        for category in skills_data.values():
            for skill in category:
                all_skills.add(skill.lower())
                if '.js' in skill.lower():
                    all_skills.add(skill.lower().replace('.js', ''))
        
        # Find matching skills
        found_skills = set()
        
        # Check single words, pairs and triplets
        for text in words + word_pairs + word_triplets:
            if text in all_skills:
                found_skills.add(text)
        
        # Check for compound skills with .js
        for word in words:
            if word.endswith('.js') and word.replace('.js', '') in all_skills:
                found_skills.add(word)
        
        found_skills = sorted(list(found_skills))
        print(f"Skills found: {found_skills}")
        return found_skills
        
    except Exception as e:
        print(f"Error in skill extraction: {str(e)}")
        return []

def extract_experience(text):
    """Extract years of experience from text."""
    try:
        # Common experience patterns
        experience_patterns = [
            r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience',
            r'experience\s*(?:of\s*)?(\d+)\s*(?:years?|yrs?)',
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:work\s*)?experience',
            r'worked\s*(?:for\s*)?(\d+)\s*(?:years?|yrs?)',
            r'(\d+)\s*(?:years?|yrs?)\s*in\s*(?:the\s*)?industry'
        ]
        
        # Look for experience mentions in the text
        text_lower = text.lower()
        for pattern in experience_patterns:
            matches = re.findall(pattern, text_lower)
            if matches:
                # Convert to integer and return first match
                try:
                    years = int(matches[0])
                    print(f"Found experience: {years} years")
                    return years
                except ValueError:
                    continue
        
        # If no explicit mention found, try to infer from work history
        work_history = re.findall(r'(\d{4})\s*-\s*(?:present|current|now|\d{4})', text_lower)
        if work_history:
            current_year = 2024  # You might want to use datetime.now().year
            earliest_year = min([int(year) for year in work_history])
            years = current_year - earliest_year
            print(f"Inferred experience from work history: {years} years")
            return years
            
        print("No experience information found")
        return 0
        
    except Exception as e:
        print(f"Error in experience extraction: {str(e)}")
        return 0
