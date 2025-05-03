# Resume Analyzer ML Service

A production-ready machine learning service for resume analysis and scoring.

## Features

- **Advanced Resume Analysis**: Extract information and score resumes using TensorFlow ML models
- **Comprehensive Scoring**: Content quality, ATS compatibility, keyword optimization, and more
- **Detailed Feedback**: Actionable recommendations for resume improvement
- **Production-Ready**: Includes monitoring, logging, error handling, and optimized performance
- **Multiple Environments**: Development, testing, and production configurations

## Requirements

- Python 3.7+
- TensorFlow 2.13.0
- Flask, Gunicorn
- Other dependencies in `requirements.txt`

## Installation

1. Clone the repository
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Install spaCy language model:

```bash
python -m spacy download en_core_web_sm
```

## Usage

### Development Mode

```bash
python app.py
```

### Production Mode

```bash
python run_production.py
```

Or with environment variables:

```bash
FLASK_ENV=production WORKERS=4 PORT=8000 python run_production.py
```

### Docker (Recommended for Production)

```bash
docker build -t resume-analyzer-ml .
docker run -p 5000:5000 resume-analyzer-ml
```

## API Endpoints

### POST /analyze

Analyze a resume file and return detailed information and scoring.

**Request:**
- Content-Type: multipart/form-data
- Body: file (PDF, DOCX, DOC, or TXT)

**Response:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "education": [...],
  "experience": [...],
  "skills": [...],
  "score": 78,
  "feedback": [...],
  "category_scores": [...]
}
```

### GET /health

Check service health status.

**Response:**
```json
{
  "status": "healthy",
  "service": "Resume Analyzer ML Service",
  "version": "2.5.0",
  "environment": "production",
  "timestamp": 1683123456.789
}
```

### GET /config

Get public configuration information.

## Environment Variables

- `FLASK_ENV`: Environment (development, testing, production)
- `SECRET_KEY`: Secret key for Flask (required in production)
- `HOST`: Host to bind to (default: 0.0.0.0)
- `PORT`: Port to run on (default: 5000)
- `WORKERS`: Number of Gunicorn workers (default: 2*CPU cores + 1)
- `REDIS_URL`: Redis URL for caching in production
- `SSL_CERT`: Path to SSL certificate
- `SSL_KEY`: Path to SSL key

## TensorFlow Model

The service uses TensorFlow for advanced resume analysis. Features include:

- Keyword optimization
- Content quality assessment
- ATS compatibility
- Quantifiable achievements detection
- Action verb analysis

## Monitoring

Prometheus metrics available at `/metrics`:

- Request count
- Request latency
- File size
- Error counts

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. 