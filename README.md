# Resume Analyzer Web Application

AI-powered resume analysis tool built with MERN stack.

## Features

- Resume upload & analysis (PDF/DOC/DOCX)
- AI-powered feedback with DeepSeek/OpenAI
- User dashboard & admin panel

## Tech Stack

- Frontend: React.js with Tailwind CSS
- Backend: Node.js with Express.js
- Database: MongoDB
- ML Service: Python with Flask/spaCy

## Quick Start

1. Clone the repository
```
git clone <repository-url>
cd resume-analyzer
```

2. Install dependencies
```
npm install
npm run install:all
```

3. Set up environment
```
npm run setup:env
cd ml-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

4. Start the application
```
npm start
```

5. Access at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - ML Service: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Resume Management
- POST /api/resume/upload - Upload resume
- GET /api/resume/history - View history
- GET /api/resume/:id - Get resume details

### Admin
- GET /api/users - Get all users
- GET /api/users/stats/summary - Get statistics

## Troubleshooting

For common issues and their solutions, please check our [documentation](https://example.com/docs). 