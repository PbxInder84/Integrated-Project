"""
TensorFlow-based resume analysis model with advanced features.
"""

import tensorflow as tf
import numpy as np
import logging
import re
import os
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import Counter

# Initialize logger
logger = logging.getLogger(__name__)

# Define model paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

# Common industry keywords by category
INDUSTRY_KEYWORDS = {
    'technical': [
        'python', 'java', 'javascript', 'html', 'css', 'sql', 'nosql', 'aws', 'azure', 'gcp',
        'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
        'docker', 'kubernetes', 'ci/cd', 'git', 'rest api', 'graphql', 'microservices',
        'machine learning', 'ai', 'data science', 'nlp', 'computer vision', 'tensorflow',
        'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'data analytics', 'big data',
        'hadoop', 'spark', 'kafka', 'elasticsearch', 'mongodb', 'postgresql', 'mysql', 'oracle',
        'frontend', 'backend', 'full stack', 'mobile', 'android', 'ios', 'swift', 'kotlin',
        'react native', 'flutter', 'devops', 'sre', 'security', 'penetration testing',
        'blockchain', 'iot', 'agile', 'scrum', 'kanban', 'jira', 'confluence'
    ],
    'soft_skills': [
        'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
        'time management', 'adaptability', 'creativity', 'collaboration', 'interpersonal',
        'presentation', 'negotiation', 'conflict resolution', 'decision making', 'emotional intelligence',
        'analytical', 'detail-oriented', 'organization', 'multitasking', 'customer service',
        'mentoring', 'training', 'project management', 'strategic thinking', 'innovation'
    ],
    'achievements': [
        'increased', 'decreased', 'improved', 'reduced', 'saved', 'generated', 'raised',
        'optimized', 'streamlined', 'automated', 'accelerated', 'enhanced', 'doubled',
        'tripled', 'grew', 'expanded', 'outperformed', 'exceeded', 'surpassed', 'awarded',
        'recognized', 'honored', 'promoted', 'launched', 'delivered', 'created', 'managed',
        'led', 'developed', 'implemented', 'designed', 'achieved', 'coordinated', 'spearheaded'
    ]
}

# Resume quality indicators
QUALITY_INDICATORS = {
    'quantifiable_results': [
        r'\d+%', r'\$\d+', r'\d+ hours', r'\d+ days', r'\d+ weeks', r'\d+ months',
        r'\d+ years', r'\d+ million', r'\d+ billion', r'\d+ thousand', r'\d+ hundred',
        r'\d+x', r'\d+ times', r'\d+ customers', r'\d+ users', r'\d+ clients', 
        r'\d+ projects', r'\d+ team members', r'\d+ people'
    ],
    'action_verbs': [
        'managed', 'led', 'developed', 'created', 'implemented', 'designed', 'achieved',
        'improved', 'increased', 'reduced', 'coordinated', 'analyzed', 'built', 'launched',
        'established', 'generated', 'supervised', 'trained', 'mentored', 'oversaw', 'executed',
        'delivered', 'negotiated', 'organized', 'produced', 'planned', 'presented', 'resolved',
        'spearheaded', 'streamlined', 'optimized', 'transformed', 'pioneered', 'formulated',
        'directed', 'cultivated', 'revitalized', 'engineered', 'administered'
    ],
    'red_flags': [
        'responsible for', 'duties include', 'assisted with', 'worked on', 'helped with',
        'I', 'me', 'my', 'objective', 'references', 'available upon request',
        'salary', 'references', 'high school', 'hobbies', 'interests'
    ]
}

class ResumeAnalyzer:
    def __init__(self):
        self.model = self._build_model()
        
    def _build_model(self):
        """Build a TensorFlow model for resume analysis"""
        try:
            # Input layer for features
            inputs = tf.keras.Input(shape=(25,))
            
            # Hidden layers
            x = tf.keras.layers.Dense(64, activation='relu')(inputs)
            x = tf.keras.layers.Dropout(0.2)(x)
            x = tf.keras.layers.Dense(32, activation='relu')(x)
            x = tf.keras.layers.Dropout(0.2)(x)
            
            # Output layers for different scoring aspects
            overall_score = tf.keras.layers.Dense(1, activation='sigmoid', name='overall_score')(x)
            ats_score = tf.keras.layers.Dense(1, activation='sigmoid', name='ats_score')(x)
            content_score = tf.keras.layers.Dense(1, activation='sigmoid', name='content_score')(x)
            keyword_score = tf.keras.layers.Dense(1, activation='sigmoid', name='keyword_score')(x)
            
            # Combine into a model
            model = tf.keras.Model(
                inputs=inputs, 
                outputs=[overall_score, ats_score, content_score, keyword_score]
            )
            
            # Compile model
            model.compile(
                optimizer='adam',
                loss={
                    'overall_score': 'mse',
                    'ats_score': 'mse',
                    'content_score': 'mse',
                    'keyword_score': 'mse'
                }
            )
            
            # Check if we can load pre-trained weights
            model_path = os.path.join(MODEL_DIR, 'resume_model.h5')
            if os.path.exists(model_path):
                try:
                    model.load_weights(model_path)
                    logger.info("Loaded pre-trained model weights")
                except:
                    logger.warning("Could not load model weights, using default model")
            
            return model
        except Exception as e:
            logger.error(f"Error building model: {str(e)}")
            return None
    
    def extract_features(self, text):
        """Extract comprehensive features from resume text"""
        # Clean and normalize text
        text = re.sub(r'\s+', ' ', text)
        text_lower = text.lower().strip()
        
        # Initialize feature dictionary
        features = {}
        
        # Basic text features
        features['length'] = min(1.0, len(text) / 7500)  # Normalize length
        features['avg_sentence_length'] = self._avg_sentence_length(text)
        features['avg_word_length'] = self._avg_word_length(text)
        
        # Keyword-based features
        for category, keywords in INDUSTRY_KEYWORDS.items():
            count = sum(1 for keyword in keywords if keyword in text_lower)
            features[f'{category}_count'] = min(1.0, count / (len(keywords) * 0.4))
        
        # Quality indicators
        for indicator_type, patterns in QUALITY_INDICATORS.items():
            if indicator_type == 'red_flags':
                # For red flags, less is better
                count = sum(len(re.findall(pattern, text_lower)) for pattern in patterns)
                features[f'{indicator_type}_score'] = max(0.0, 1.0 - (count / 10))
            else:
                count = sum(len(re.findall(pattern, text_lower)) for pattern in patterns)
                features[f'{indicator_type}_score'] = min(1.0, count / 15)
        
        # Structure features
        features['has_bullets'] = 1.0 if re.search(r'[•\*\-]\s', text) else 0.0
        features['has_sections'] = 1.0 if len(re.findall(r'\n[A-Z][A-Za-z\s]+:?\n', text)) > 2 else 0.0
        
        # Education/Experience features
        features['has_education'] = 1.0 if re.search(r'education|university|college|bachelor|master|phd|degree', text_lower) else 0.0
        features['has_experience'] = 1.0 if re.search(r'experience|work|job|position|role|career', text_lower) else 0.0
        features['has_skills'] = 1.0 if re.search(r'skills|proficiencies|expertise|competencies', text_lower) else 0.0
        features['has_contact'] = 1.0 if re.search(r'email|phone|contact|linkedin|github', text_lower) else 0.0
        
        # Format to numpy array in consistent order
        feature_names = sorted(features.keys())
        feature_vector = np.array([features[name] for name in feature_names])
        
        # Pad to expected dimension (25)
        if len(feature_vector) < 25:
            feature_vector = np.pad(feature_vector, (0, 25 - len(feature_vector)))
        elif len(feature_vector) > 25:
            feature_vector = feature_vector[:25]
            
        return {
            'features': features,
            'feature_vector': feature_vector,
            'feature_names': feature_names
        }
        
    def _avg_sentence_length(self, text):
        """Calculate average sentence length"""
        sentences = re.split(r'[.!?]+', text)
        if not sentences:
            return 0.0
        words_per_sentence = [len(re.findall(r'\b\w+\b', s)) for s in sentences if s.strip()]
        if not words_per_sentence:
            return 0.0
        avg_length = sum(words_per_sentence) / len(words_per_sentence)
        # Normalize: optimal is around 15-25 words
        return min(1.0, (avg_length / 20) if avg_length <= 20 else (30 / avg_length))
        
    def _avg_word_length(self, text):
        """Calculate average word length"""
        words = re.findall(r'\b\w+\b', text)
        if not words:
            return 0.0
        avg_length = sum(len(word) for word in words) / len(words)
        # Normalize: optimal is around 5-7 characters
        return min(1.0, (avg_length / 6) if avg_length <= 6 else (8 / avg_length))
    
    def analyze(self, text):
        """Analyze a resume and return comprehensive scoring"""
        try:
            # Extract features
            feature_data = self.extract_features(text)
            
            # If model is not available, use rules-based approach
            if self.model is None:
                return self._rules_based_analysis(feature_data['features'])
            
            # Use the model for prediction
            predictions = self.model.predict(
                np.array([feature_data['feature_vector']]), 
                verbose=0
            )
            
            # Extract scores (scale to 0-100)
            scores = {
                'overall_score': int(predictions[0][0][0] * 100),
                'ats_compatibility': int(predictions[1][0][0] * 100),
                'content_quality': int(predictions[2][0][0] * 100),
                'keyword_optimization': int(predictions[3][0][0] * 100)
            }
            
            # Generate feedback
            feedback = self._generate_feedback(feature_data['features'], scores)
            
            return {
                'scores': scores,
                'feedback': feedback,
                'features': feature_data['features']
            }
            
        except Exception as e:
            logger.error(f"Error analyzing resume: {str(e)}")
            # Fallback to rules-based approach
            return self._rules_based_analysis(self.extract_features(text)['features'])
    
    def _rules_based_analysis(self, features):
        """Fallback method using rules-based scoring"""
        # Calculate scores based on features
        weights = {
            'length': 0.05,
            'avg_sentence_length': 0.05,
            'avg_word_length': 0.05,
            'technical_count': 0.15,
            'soft_skills_count': 0.10,
            'achievements_count': 0.15,
            'quantifiable_results_score': 0.15,
            'action_verbs_score': 0.10,
            'red_flags_score': 0.05,
            'has_bullets': 0.03,
            'has_sections': 0.02,
            'has_education': 0.025,
            'has_experience': 0.025,
            'has_skills': 0.025,
            'has_contact': 0.025
        }
        
        # Calculate content quality
        content_quality = sum(
            features.get(f, 0) * w for f, w in {
                'avg_sentence_length': 0.1,
                'action_verbs_score': 0.3,
                'red_flags_score': 0.15,
                'has_bullets': 0.15,
                'has_sections': 0.15,
                'quantifiable_results_score': 0.15
            }.items()
        ) * 100
        
        # Calculate ATS compatibility
        ats_compatibility = sum(
            features.get(f, 0) * w for f, w in {
                'technical_count': 0.25,
                'soft_skills_count': 0.15,
                'has_education': 0.15,
                'has_experience': 0.15,
                'has_skills': 0.15,
                'has_contact': 0.15
            }.items()
        ) * 100
        
        # Calculate keyword optimization
        keyword_optimization = sum(
            features.get(f, 0) * w for f, w in {
                'technical_count': 0.4,
                'soft_skills_count': 0.3,
                'achievements_count': 0.3
            }.items()
        ) * 100
        
        # Calculate overall score
        overall_score = sum(
            features.get(f, 0) * w for f, w in weights.items() if f in features
        ) * 100
        
        # Ensure scores are within bounds
        scores = {
            'overall_score': max(0, min(100, int(overall_score))),
            'ats_compatibility': max(0, min(100, int(ats_compatibility))),
            'content_quality': max(0, min(100, int(content_quality))),
            'keyword_optimization': max(0, min(100, int(keyword_optimization)))
        }
        
        # Generate feedback
        feedback = self._generate_feedback(features, scores)
        
        return {
            'scores': scores,
            'feedback': feedback,
            'features': features
        }
    
    def _generate_feedback(self, features, scores):
        """Generate actionable feedback based on features and scores"""
        feedback = []
        
        # Content quality feedback
        if scores['content_quality'] < 60:
            if features.get('action_verbs_score', 0) < 0.3:
                feedback.append("Use more powerful action verbs (like 'achieved', 'developed', 'implemented') to describe your experience")
            
            if features.get('quantifiable_results_score', 0) < 0.3:
                feedback.append("Add measurable achievements with specific numbers (%, $, time saved) to demonstrate your impact")
            
            if features.get('has_bullets', 0) < 0.5:
                feedback.append("Use bullet points to make your resume more scannable and easier to read")
                
            if features.get('red_flags_score', 0) < 0.7:
                feedback.append("Remove passive phrases like 'responsible for' and personal pronouns (I, me, my)")
        
        # ATS compatibility feedback
        if scores['ats_compatibility'] < 60:
            if features.get('technical_count', 0) < 0.3:
                feedback.append("Include more industry-specific keywords and technical skills relevant to your target positions")
                
            if features.get('has_sections', 0) < 0.5:
                feedback.append("Organize your resume with clear section headings (Experience, Education, Skills) for better ATS parsing")
                
            if features.get('has_contact', 0) < 0.8:
                feedback.append("Ensure your contact information is complete and easy to find at the top of your resume")
        
        # Keyword optimization feedback
        if scores['keyword_optimization'] < 60:
            if features.get('technical_count', 0) < 0.3 and features.get('soft_skills_count', 0) < 0.3:
                feedback.append("Add more relevant keywords from job descriptions you're targeting to improve your match rate")
                
            if features.get('soft_skills_count', 0) < 0.2:
                feedback.append("Include some soft skills (communication, leadership, problem-solving) to complement your technical abilities")
        
        # Length-related feedback
        if features.get('length', 0) < 0.2:
            feedback.append("Your resume may be too short. Consider adding more details about your experience and achievements")
        elif features.get('length', 0) > 0.9:
            feedback.append("Your resume may be too long. Focus on the most relevant information and aim for 1-2 pages")
        
        # Return a limited number of most important feedback items
        return sorted(feedback, key=len)[:5]

# Create an instance for the module
analyzer = ResumeAnalyzer()

def analyze_resume_with_tensorflow(text):
    """Public function to analyze resume using TensorFlow model"""
    result = analyzer.analyze(text)
    return result
