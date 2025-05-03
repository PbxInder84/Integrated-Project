"""
Configuration settings for the Resume Analyzer ML Service.
Includes different configurations for development, testing, and production environments.
"""

import os
import logging
from datetime import timedelta

# Load environment variables from .env file if it exists
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Force development mode by default
if 'FLASK_ENV' not in os.environ:
    os.environ['FLASK_ENV'] = 'development'

# Base configuration class
class Config:
    # Application settings
    APP_NAME = "Resume Analyzer ML Service"
    VERSION = "2.5.0"
    
    # Directory settings
    PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(PROJECT_ROOT, 'uploads')
    LOG_FOLDER = os.path.join(PROJECT_ROOT, 'logs')
    MODEL_FOLDER = os.path.join(PROJECT_ROOT, 'utils', 'models')
    
    # Create necessary directories
    for folder in [UPLOAD_FOLDER, LOG_FOLDER, MODEL_FOLDER]:
        if not os.path.exists(folder):
            os.makedirs(folder)
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB limit for file uploads
    
    # CORS settings
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
    
    # API rate limiting
    RATELIMIT_DEFAULT = "100 per minute"
    RATELIMIT_STORAGE_URL = "memory://"
    RATELIMIT_STRATEGY = "fixed-window"
    
    # TensorFlow settings
    TF_CPP_MIN_LOG_LEVEL = '2'  # Suppress TensorFlow logging (0=all, 1=info, 2=warnings, 3=errors)
    USE_TENSORFLOW = True
    USE_ADVANCED_MODEL = True
    
    # Logging settings
    LOG_LEVEL = logging.INFO
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_FILE = os.path.join(LOG_FOLDER, 'ml_service.log')
    
    # File processing settings
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}
    
    # Resume Scoring weights
    SCORE_WEIGHTS = {
        "Contact Information": 10,
        "Education": 15,
        "Experience": 30,
        "Skills": 25,
        "Content Quality": 15,
        "Additional Sections": 5
    }
    
    # Cache settings
    CACHE_TYPE = "SimpleCache"
    CACHE_DEFAULT_TIMEOUT = 300  # 5 minutes

class DevelopmentConfig(Config):
    """Development configuration settings"""
    DEBUG = True
    TESTING = False
    ENV = 'development'
    LOG_LEVEL = logging.DEBUG
    
    # Override production URLs
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
    
    # For development, we can use memory cache
    CACHE_TYPE = "SimpleCache"
    
    # More debugging information
    PRESERVE_CONTEXT_ON_EXCEPTION = True
    
    # Keep files around longer for debugging
    FILE_DELETE_DELAY = timedelta(minutes=30)

class TestingConfig(Config):
    """Testing configuration settings"""
    DEBUG = False
    TESTING = True
    ENV = 'testing'
    
    # Use in-memory storage for testing
    UPLOAD_FOLDER = os.path.join(Config.PROJECT_ROOT, 'test_uploads')
    
    # Disable TensorFlow for faster tests
    USE_TENSORFLOW = False
    USE_ADVANCED_MODEL = False
    
    # No rate limiting during tests
    RATELIMIT_ENABLED = False
    
    # Smaller cache timeout for testing
    CACHE_DEFAULT_TIMEOUT = 30  # 30 seconds

class ProductionConfig(Config):
    """Production configuration settings"""
    DEBUG = False
    TESTING = False
    ENV = 'production'
    
    # Load secret key from environment
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        # Fallback for production - not recommended for real production environments
        SECRET_KEY = 'production-fallback-key-replace-me'
        logging.warning("Using fallback SECRET_KEY in production. This is not secure!")
    
    # Production CORS settings
    CORS_ORIGINS = [
        'https://resume-analyzer.example.com',  # Replace with your actual domain
        os.environ.get('FRONTEND_URL', '')
    ]
    
    # More restrictive upload settings
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB limit
    
    # Redis for production caching and rate limiting
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    
    # Log to file in production
    LOG_LEVEL = logging.WARNING
    
    # Clean up temporary files quickly
    FILE_DELETE_DELAY = timedelta(minutes=5)
    
    # Health check settings
    HEALTH_CHECK_ENABLED = True

# Select configuration based on environment
def get_config():
    env = os.environ.get('FLASK_ENV', 'development')
    if env == 'production':
        return ProductionConfig
    elif env == 'testing':
        return TestingConfig
    else:
        return DevelopmentConfig

# Current configuration
config = get_config() 