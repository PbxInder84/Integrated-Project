#!/usr/bin/env python3
"""
Production launch script for Resume Analyzer ML Service.
Uses Gunicorn for WSGI serving with optimized production settings.
"""

import os
import sys
import logging
import multiprocessing
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set Flask environment to production
os.environ["FLASK_ENV"] = "production"

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("production.log")
    ]
)
logger = logging.getLogger(__name__)

def get_workers():
    """Calculate optimal number of Gunicorn workers"""
    try:
        # Based on common formula: 2 * cores + 1
        return 2 * multiprocessing.cpu_count() + 1
    except:
        # Fallback to reasonable default if CPU count can't be determined
        return 4

if __name__ == "__main__":
    try:
        # Import necessary modules
        from gunicorn.app.base import BaseApplication
        from app import app as flask_app
        from config import config
        
        # Print startup message
        logger.info(f"Starting {config.APP_NAME} v{config.VERSION} in production mode")
        
        # Prepare Gunicorn launch command
        host = os.environ.get("HOST", "0.0.0.0")
        port = os.environ.get("PORT", "5000")
        workers = os.environ.get("WORKERS", str(get_workers()))
        
        # Check for SSL configuration
        certfile = os.environ.get("SSL_CERT")
        keyfile = os.environ.get("SSL_KEY")
        
        # Build command arguments
        bind = f"{host}:{port}"
        gunicorn_args = [
            "gunicorn",
            "--bind", bind,
            "--workers", workers,
            "--timeout", "120",
            "--worker-class", "sync",
            "--worker-tmp-dir", "/dev/shm",  # Use shared memory for worker tmp (faster)
            "--log-level", "info",
            "--access-logfile", "access.log",
            "--error-logfile", "error.log",
        ]
        
        # Add SSL arguments if configured
        if certfile and keyfile and os.path.exists(certfile) and os.path.exists(keyfile):
            gunicorn_args.extend([
                "--certfile", certfile,
                "--keyfile", keyfile
            ])
            logger.info(f"SSL enabled with {certfile}")
        
        # Add application
        gunicorn_args.append("app:app")
        
        # Print command for logging
        logger.info(f"Launch command: {' '.join(gunicorn_args)}")
        
        # Launch with os.execvp to replace the current process
        logger.info(f"Starting Gunicorn with {workers} workers on {bind}")
        
        # Execute Gunicorn
        os.execvp("gunicorn", gunicorn_args)
        
    except ImportError as e:
        logger.error(f"Missing required module: {str(e)}")
        logger.error("Make sure all requirements are installed (pip install -r requirements.txt)")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error starting server: {str(e)}", exc_info=True)
        sys.exit(1) 