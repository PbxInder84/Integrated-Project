"""
Resume scoring module with improved analytics and assessment criteria.
"""

import logging
import re
from nltk.tokenize import word_tokenize, sent_tokenize
from textblob import TextBlob
import string
import datetime  # Add missing import for datetime

# Initialize logger
logger = logging.getLogger(__name__)

# Custom functions to avoid NLTK tokenization issues
def custom_word_tokenize(text):
    """Simple word tokenizer as fallback if NLTK fails"""
    try:
        return word_tokenize(text)
    except:
        # Simple fallback tokenizer
        return re.findall(r'\b\w+\b', text)

def custom_sent_tokenize(text):
    """Simple sentence tokenizer as fallback if NLTK fails"""
    try:
        return sent_tokenize(text)
    except:
        # Simple fallback for sentence tokenization
        return [s.strip() for s in re.split(r'(?<=[.!?])\s+', text)]

def score_resume(extracted_info, text):
    """
    Score a resume based on various criteria and provide detailed feedback.
    
    Args:
        extracted_info (dict): Dictionary of extracted resume information
        text (str): Full text of the resume
        
    Returns:
        dict: Scoring results with overall score and feedback
    """
    try:
        logger.info("Starting resume scoring")
        
        # Initialize score and feedback
        score = 0
        feedback = []
        scores_by_category = {}
        
        # Get scores for each category
        contact_score, contact_feedback = score_contact_info(extracted_info)
        scores_by_category["Contact Information"] = contact_score
        feedback.extend(contact_feedback)
        
        education_score, education_feedback = score_education(extracted_info)
        scores_by_category["Education"] = education_score
        feedback.extend(education_feedback)
        
        experience_score, experience_feedback = score_experience(extracted_info)
        scores_by_category["Experience"] = experience_score
        feedback.extend(experience_feedback)
        
        skills_score, skills_feedback = score_skills(extracted_info)
        scores_by_category["Skills"] = skills_score
        feedback.extend(skills_feedback)
        
        content_score, content_feedback = score_content_quality(text, extracted_info)
        scores_by_category["Content Quality"] = content_score
        feedback.extend(content_feedback)
        
        additional_score, additional_feedback = score_additional_sections(extracted_info)
        scores_by_category["Additional Sections"] = additional_score
        feedback.extend(additional_feedback)
        
        # Calculate total score with weighted categories
        weights = {
            "Contact Information": 10,  # Basic but essential
            "Education": 15,           # Important but not always the focus
            "Experience": 30,          # Usually most important
            "Skills": 25,              # Very important
            "Content Quality": 15,     # Overall quality matters
            "Additional Sections": 5   # Nice to have
        }
        
        total_score = 0
        for category, category_score in scores_by_category.items():
            total_score += category_score * weights[category] / 100
        
        # Ensure score is within bounds
        total_score = max(0, min(round(total_score), 100))
        
        # Add score by category to detailed feedback
        category_scores = [f"{category}: {score}/100" for category, score in scores_by_category.items()]
        
        # Prioritize and limit feedback to most important points
        feedback = prioritize_feedback(feedback)
        
        logger.info(f"Resume scoring completed with score: {total_score}")
        
        return {
            "score": total_score,
            "feedback": feedback,
            "category_scores": category_scores
        }
        
    except Exception as e:
        logger.error(f"Error in resume scoring: {str(e)}", exc_info=True)
        # Return a default score in case of error
        return {
            "score": 50,  # Neutral score
            "feedback": ["Error processing the resume for scoring. Please check the format and try again."]
        }

def score_contact_info(extracted_info):
    """Score contact information completeness and quality."""
    score = 0
    feedback = []
    
    # Check name
    if extracted_info.get("name"):
        score += 25
    else:
        feedback.append("Name not clearly identified at the top of the resume")
    
    # Check email
    if extracted_info.get("email"):
        score += 25
        # Check if it's a professional email address
        email = extracted_info.get("email", "")
        if "gmail" not in email and "hotmail" not in email and "yahoo" not in email:
            score += 10
        elif any(unprofessional in email.lower() for unprofessional in ["fun", "cool", "party", "game"]):
            feedback.append("Consider using a more professional email address")
    else:
        feedback.append("Email address missing or not in standard format")
    
    # Check phone
    if extracted_info.get("phone"):
        score += 25
    else:
        feedback.append("Phone number missing or not in standard format")
    
    # Check for online profiles
    if extracted_info.get("linkedin"):
        score += 15
    else:
        feedback.append("Consider adding your LinkedIn profile to the resume")
    
    if extracted_info.get("github") and len(extracted_info.get("skills", [])) > 0 and any(tech in " ".join(extracted_info.get("skills", [])).lower() for tech in ["software", "develop", "program", "code"]):
        score += 10
    
    return min(100, score), feedback

def score_education(extracted_info):
    """Score education section completeness and relevance."""
    score = 0
    feedback = []
    
    education = extracted_info.get("education", [])
    
    if not education:
        feedback.append("Education information missing or not clearly identified")
        return 0, feedback
    
    # Base score for having education section
    score += 50
    
    # Score based on detail level
    detail_score = 0
    for edu in education:
        # Check if education entry contains a year/date
        if re.search(r'(?:19|20)\d{2}', edu):
            detail_score += 5
        
        # Check if it contains degree information
        degree_keywords = ['bachelor', 'master', 'phd', 'associate', 'degree', 'diploma', 'certificate']
        if any(keyword in edu.lower() for keyword in degree_keywords):
            detail_score += 10
        
        # Check if it mentions the institution
        if any(word.lower() in edu.lower() for word in ['university', 'college', 'institute', 'school']):
            detail_score += 5
    
    # Cap the detail score
    detail_score = min(40, detail_score)
    score += detail_score
    
    # Add feedback based on detail level
    if detail_score < 15:
        feedback.append("Add more details to your education entries (institution, degree, graduation year)")
    
    # Award bonus for multiple education entries
    if len(education) > 1:
        score += 10
    
    return min(100, score), feedback

def score_experience(extracted_info):
    """Score work experience section for detail, clarity and impact."""
    score = 0
    feedback = []
    
    experience = extracted_info.get("experience", [])
    
    if not experience:
        feedback.append("Work experience information missing or not clearly identified")
        return 0, feedback
    
    # Base score for having experience
    score += 40
    
    # Check number of positions
    num_positions = len(experience)
    if num_positions >= 3:
        score += 15
    elif num_positions >= 2:
        score += 10
    elif num_positions == 1:
        score += 5
    
    # Check experience detail level
    detail_level = 0
    for exp in experience:
        # Check for dates
        if re.search(r'(?:19|20)\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)', exp):
            detail_level += 5
        
        # Check for job title
        if any(word.title() in exp for word in ['engineer', 'manager', 'developer', 'analyst', 'designer', 'director', 'specialist', 'consultant']):
            detail_level += 5
        
        # Check for company name
        if 'at ' in exp:
            detail_level += 5
    
    # Award points for detail level
    score += min(30, detail_level)
    
    # Check if experience is current
    has_current = any('present' in exp.lower() or 'current' in exp.lower() or str(datetime.datetime.now().year) in exp for exp in experience)
    if has_current:
        score += 5
    else:
        feedback.append("Consider clearly indicating your current position")
    
    # Feedback based on overall experience presentation
    if score < 60:
        feedback.append("Strengthen your experience section with more details about roles, companies, and dates")
    
    return min(100, score), feedback

def score_skills(extracted_info):
    """Score skills section for relevance, organization and specificity."""
    score = 0
    feedback = []
    
    skills = extracted_info.get("skills", [])
    
    if not skills:
        feedback.append("No specific skills identified or skills section missing")
        return 0, feedback
    
    # Base score for having skills
    score += 30
    
    # Score based on number of skills
    skill_count = len(skills)
    if skill_count >= 15:
        score += 25
    elif skill_count >= 10:
        score += 20
    elif skill_count >= 5:
        score += 15
    else:
        feedback.append("Add more relevant skills to stand out (aim for 10+ skills)")
    
    # Score based on skill specificity
    specific_skills = 0
    generic_terms = ['communication', 'teamwork', 'organization', 'management', 
                     'leadership', 'detail-oriented', 'problem solving', 'time management']
    
    for skill in skills:
        if all(generic.lower() not in skill.lower() for generic in generic_terms):
            specific_skills += 1
    
    # Award points for specific skills
    specificity_ratio = specific_skills / max(1, skill_count)
    if specificity_ratio > 0.7:
        score += 20
    elif specificity_ratio > 0.5:
        score += 15
    elif specificity_ratio > 0.3:
        score += 10
    else:
        feedback.append("Include more specific technical or domain skills rather than generic skills")
    
    # Award points for having technical skills if there are any programming languages or technical terms
    technical_keywords = ['python', 'java', 'javascript', 'c++', 'sql', 'html', 'css', 'react', 
                          'angular', 'node', 'aws', 'azure', 'cloud', 'database', 'algorithm', 
                          'linux', 'docker', 'kubernetes', 'git', 'tensorflow', 'pytorch']
    
    has_technical = any(tech in " ".join(skills).lower() for tech in technical_keywords)
    if has_technical:
        score += 15
    
    # Organization - Difficult to assess without visual layout, but we can check for variety
    skill_categories = {
        "technical": ['python', 'java', 'javascript', 'sql', 'html', 'css', 'react'],
        "tools": ['git', 'jira', 'confluence', 'docker', 'jenkins', 'github', 'bitbucket'],
        "soft": ['leadership', 'communication', 'teamwork', 'problem solving'],
        "domain": ['finance', 'marketing', 'healthcare', 'insurance', 'banking', 'retail']
    }
    
    categories_present = 0
    for category, keywords in skill_categories.items():
        if any(any(kw in skill.lower() for kw in keywords) for skill in skills):
            categories_present += 1
    
    # Award points for skill diversity
    if categories_present >= 3:
        score += 10
    elif categories_present >= 2:
        score += 5
    else:
        feedback.append("Include a more diverse range of skills (technical, tools, soft skills, domain knowledge)")
    
    return min(100, score), feedback

def score_content_quality(text, extracted_info):
    """Score the overall quality, readability and format of the resume."""
    score = 0
    feedback = []
    
    # Check for reasonable length
    words = custom_word_tokenize(text)
    word_count = len(words)
    
    if 300 <= word_count <= 700:
        score += 20  # Ideal length
    elif word_count < 200:
        score += 5
        feedback.append("Resume is too short. Add more relevant details about your experience and skills.")
    elif word_count > 1000:
        score += 10
        feedback.append("Resume may be too verbose. Consider making it more concise.")
    else:
        score += 15  # Reasonable length
    
    # Check for readability
    sentences = custom_sent_tokenize(text)
    if sentences:
        # Average sentence length
        avg_sent_length = word_count / len(sentences)
        if 10 <= avg_sent_length <= 20:
            score += 15  # Good sentence length
        elif avg_sent_length > 25:
            score += 5
            feedback.append("Some sentences are too long. Break them down for better readability.")
        else:
            score += 10
        
        # Check for sentences that are too long
        long_sentences = [s for s in sentences if len(custom_word_tokenize(s)) > 30]
        if len(long_sentences) > 5:
            feedback.append("Too many long sentences. Aim for shorter, impactful statements.")
            score -= 5
    
    # Check for action words
    action_verbs = ['developed', 'implemented', 'created', 'designed', 'managed', 'led', 
                   'improved', 'reduced', 'increased', 'achieved', 'negotiated', 'coordinated',
                   'established', 'supervised', 'generated', 'delivered', 'analyzed']
    
    action_verb_count = sum(1 for word in words if word.lower() in action_verbs)
    
    if action_verb_count >= 5:
        score += 15
    elif action_verb_count >= 3:
        score += 10
    else:
        score += 5
        feedback.append("Use more action verbs to describe your accomplishments and responsibilities.")
    
    # Check for quantifiable achievements
    percentage_pattern = r'\d+(\.\d+)?%'
    number_pattern = r'\$\d+|increased by \d+|\d+ percent|grew \d+|\d+ times'
    
    percentages = re.findall(percentage_pattern, text)
    numbers = re.findall(number_pattern, text)
    
    if percentages or numbers:
        score += 15
    else:
        feedback.append("Include quantifiable achievements (e.g., increased sales by 25%, reduced costs by $10k)")
    
    # Check for typos and grammatical issues (basic check)
    try:
        blob = TextBlob(text)
        text_without_names = " ".join([word for word in words 
                                      if word.lower() not in [extracted_info.get("name", "").lower()]])
        
        # Count detected typos
        potential_typos = [word for word in words 
                          if word.isalpha() and len(word) > 3 and word.lower() not in blob.words.lower()]
        
        if len(potential_typos) > 10:
            score -= 10
            feedback.append("Proofread for potential spelling errors or typos.")
    except:
        # If TextBlob analysis fails, skip this part
        pass
    
    # Check for consistency in formatting (difficult without visual, using basic heuristics)
    if len(sentences) > 5:
        # Check if most sentences start with capital letters
        capital_starts = sum(1 for s in sentences if s and s[0].isupper())
        if capital_starts / len(sentences) < 0.8:
            score -= 5
            feedback.append("Ensure consistent capitalization at the beginning of statements.")
    
    # Check for bullet point usage
    bullet_indicators = ['•', '-', '*', '>', '✓']
    has_bullets = any(bi in text for bi in bullet_indicators)
    if has_bullets:
        score += 10
    else:
        feedback.append("Consider using bullet points to highlight accomplishments and responsibilities.")
    
    # Check for filler words
    filler_words = ['very', 'really', 'basically', 'actually', 'literally', 'just', 'quite']
    filler_count = sum(1 for word in words if word.lower() in filler_words)
    
    if filler_count > 5:
        score -= 5
        feedback.append("Reduce filler words like 'very', 'really', 'basically', etc.")
    
    # Check for personal pronouns (should typically be avoided in resumes)
    pronouns = ['I', 'me', 'my', 'mine', 'myself', 'we', 'our', 'us']
    pronoun_count = sum(1 for word in words if word.lower() in [p.lower() for p in pronouns])
    
    if pronoun_count > 5:
        score -= 5
        feedback.append("Minimize use of personal pronouns (I, me, my) in your resume.")
    
    return min(100, max(0, score)), feedback

def score_additional_sections(extracted_info):
    """Score additional resume sections that add value."""
    score = 0
    feedback = []
    
    # Check for summary/objective
    if extracted_info.get("summary"):
        summary = extracted_info.get("summary")
        if len(summary) > 30:  # Ensure it's not too short
            score += 20
            
            # Check if summary is too generic
            generic_phrases = ['hard worker', 'team player', 'detail-oriented', 
                             'highly motivated', 'passionate professional']
            
            if any(phrase in summary.lower() for phrase in generic_phrases):
                score -= 5
                feedback.append("Make your summary more specific and tailored rather than using generic phrases.")
    else:
        feedback.append("Consider adding a professional summary to highlight your value proposition.")
    
    # Check for certifications
    certifications = extracted_info.get("certifications", [])
    if certifications:
        score += 20
        # Bonus points for multiple certifications
        if len(certifications) >= 3:
            score += 10
    else:
        feedback.append("Adding relevant certifications can strengthen your resume")
    
    # Check for languages
    languages = extracted_info.get("languages", [])
    if languages:
        score += 20
        # Bonus points for multiple languages
        if len(languages) >= 2:
            score += 10
    else:
        feedback.append("Consider adding a languages section if you speak multiple languages")
    
    # Check for additional valuable sections (we'd need more extraction for these)
    # - Projects
    # - Publications
    # - Volunteer work
    # - Awards
    
    # Check for these keywords in the text as a simple heuristic
    additional_section_keywords = ['project', 'publication', 'volunteer', 'award', 'honor', 'patent']
    
    # We'll assume the resume text is available in extracted_info for this check
    resume_text = extracted_info.get("_full_text", "")  # This would need to be added to the extraction
    
    if not resume_text:
        # If not available, we'll use what we have
        resume_text = " ".join([
            extracted_info.get("summary", ""),
            " ".join(extracted_info.get("education", [])),
            " ".join(extracted_info.get("experience", []))
        ])
    
    for keyword in additional_section_keywords:
        if re.search(r'\b' + re.escape(keyword) + r's?\b', resume_text, re.IGNORECASE):
            score += 5
    
    return min(100, score), feedback

def prioritize_feedback(feedback_list, max_items=5):
    """
    Prioritize feedback items by importance and limit the total number.
    
    Args:
        feedback_list: List of feedback items
        max_items: Maximum number of feedback items to return
        
    Returns:
        list: Prioritized feedback items
    """
    if not feedback_list:
        return []
    
    # Define priority keywords
    high_priority = ['missing', 'add', 'include', 'strengthen', 'consider adding']
    medium_priority = ['improve', 'enhance', 'make', 'provide', 'ensure']
    
    # Sort feedback by priority
    sorted_feedback = []
    
    # First add high priority items
    for item in feedback_list:
        if any(word in item.lower() for word in high_priority):
            sorted_feedback.append(item)
    
    # Then add medium priority items
    for item in feedback_list:
        if item not in sorted_feedback and any(word in item.lower() for word in medium_priority):
            sorted_feedback.append(item)
    
    # Finally add remaining items
    for item in feedback_list:
        if item not in sorted_feedback:
            sorted_feedback.append(item)
    
    # Return limited list
    return sorted_feedback[:max_items] 