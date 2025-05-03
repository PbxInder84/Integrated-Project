# Resume Analyzer Backend

Express.js backend service for the Resume Analyzer application.

## Setup

```
npm install
```

## Environment

Create a `.env` file with:

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/resume-analyzer
JWT_SECRET=your_secret_key
NODE_ENV=development
OPENAI_API_KEY=your_key_here
DEEPSEEK_API_KEY=your_key_here
```

## Running

```
npm run dev  # development
npm start    # production
```

## API Endpoints

### Auth
- POST /api/auth/register - Register user
- POST /api/auth/login - Login user

### Resume
- POST /api/resume/upload - Upload and analyze
- GET /api/resume/history - View history

## Structure

- `/controllers` - Request handlers
- `/models` - MongoDB schemas
- `/routes` - API routes
- `/middleware` - Custom middleware
- `/utils` - Helper functions 