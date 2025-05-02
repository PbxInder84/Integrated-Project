# Resume Analyzer Web Application

A full-stack web application that analyzes resumes and provides feedback, built with MERN stack and ML capabilities.

## Features

- Resume upload (PDF/DOC/DOCX)
- Resume parsing and content extraction
- Resume scoring and feedback
- AI-powered analysis with DeepSeek API integration
- User dashboard for past analyses
- Admin panel for system management

## Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **ML Service**: Python with Flask/spaCy for NLP

## Project Structure

```
resume-analyzer/
├── backend/             # Express.js server
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── uploads/         # Uploaded resume files
│   └── server.js        # Main server file
├── frontend/            # React.js application
│   ├── public/          # Static files
│   └── src/             # React source code
│       ├── components/  # React components
│       │   ├── Admin/   # Admin components
│       │   ├── Auth/    # Authentication components
│       │   ├── Dashboard/ # User dashboard
│       │   ├── Layout/  # Layout components
│       │   └── Resume/  # Resume-related components
│       ├── App.js       # Main App component
│       └── index.js     # Entry point
└── ml-service/          # Python Flask ML service
    ├── uploads/         # Temporary resume storage
    └── app.py           # Main ML service
```

## Prerequisites

- Node.js (v14+)
- MongoDB
- Python (v3.8+)
- npm or yarn

## Installation

1. Clone the repository
```
git clone <repository-url>
cd resume-analyzer
```

2. Install root dependencies
```
npm install
```

3. Install service dependencies
```
npm run install:all
```

4. Set up environment variables
```
npm run setup:env
```
This interactive script will help you configure your environment variables including the DeepSeek API key.

5. Set up Python environment for ML service
```
cd ml-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

## Running the Application

1. Make sure MongoDB is running locally or update the connection string in `backend/.env`

2. Start all services at once:
```
npm start
```

Or start services individually:

- Backend API: `npm run start:backend`
- Frontend: `npm run start:frontend`
- ML Service: `npm run start:ml`

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - ML Service: http://localhost:5000

## Production Deployment

To deploy the application to production:

1. Create a `.env` file in the backend directory with production settings:
```
PORT=5001
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=long_random_secure_string
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key
```

2. Install all dependencies and build the frontend:
```
npm run prod:install
npm run prod:build
```

3. Start the production server:
   - On Linux/Mac: `npm run prod:start`
   - On Windows: `npm run prod:start:win`

### Deploying to Heroku

1. Create a new Heroku application
2. Set up environment variables in Heroku dashboard: 
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
3. Deploy using Git:
```
heroku login
heroku git:remote -a your-heroku-app-name
git push heroku main
```

Heroku will automatically run the `heroku-postbuild` script to install dependencies and build the frontend.

### Deploying with Docker

1. Build the Docker image:
```
docker build -t resume-analyzer .
```

2. Run the container:
```
docker run -p 5001:5001 -p 5000:5000 -e MONGODB_URI=your_mongodb_uri -e JWT_SECRET=your_jwt_secret -e NODE_ENV=production resume-analyzer
```

## Setting up DeepSeek API for AI Analysis

The resume analyzer includes AI-powered resume analysis using DeepSeek's API. To set up this feature:

1. Run the environment setup script which will create the necessary .env files:
   ```
   npm run setup:env
   ```

2. Alternatively, manually follow the [Environment Variables Setup Guide](./ENV_SETUP.md) for detailed instructions

3. Important: The DeepSeek API key must be configured in BOTH the root directory and the backend directory .env files

Note: The DeepSeek API may have rate limits and usage costs. Check [DeepSeek pricing](https://deepseek.com/pricing) for more details.

## Setting up OpenAI for AI Analysis

The resume analyzer includes AI-powered resume analysis using OpenAI's API. To set up this feature:

1. Create an account on [OpenAI](https://openai.com/) if you don't have one
2. Navigate to API keys section in your OpenAI dashboard
3. Create a new API key
4. Add the API key to your backend `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

The application uses the GPT-3.5 Turbo model by default. You can modify the model in `backend/utils/openai.js` if needed.

Note: The OpenAI API is not free, but it offers free credits for new users. After that, you'll be charged based on your usage. See [OpenAI pricing](https://openai.com/pricing) for more details.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current logged-in user

### Resume Management
- `POST /api/resume/upload` - Upload and analyze resume
- `GET /api/resume/history` - Get user's resume history
- `GET /api/resume/:id` - Get specific resume details
- `POST /api/resume/:id/reanalyze` - Re-analyze an existing resume
- `POST /api/resume/:id/ai-analysis` - Generate AI-powered resume analysis
- `DELETE /api/resume/:id` - Delete a resume

### Admin
- `GET /api/users` - Get all users (admin only)
- `PATCH /api/users/:id/role` - Update user role (admin only)
- `GET /api/users/stats/summary` - Get system statistics (admin only)

### ML Service
- `POST /analyze` - Analyze resume file
- `GET /health` - Check ML service health

## Development

To run the development environment with hot reloading:

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm start`
3. Start the ML service: `cd ml-service && python app.py`

## Troubleshooting

### Common Issues

1. **Login/Registration fails**:
   - Check that MongoDB is running
   - Verify the JWT_SECRET is correctly set
   - Check that backend server is running on the expected port (5001)

2. **Resume upload fails**:
   - Ensure the ML service is running on port 5000
   - Check that the uploads folder exists and has proper permissions

3. **AI analysis not working**:
   - Verify that DEEPSEEK_API_KEY is set in both root AND backend .env files
   - Run `npm run copy:env` to copy your root .env to the backend directory
   - Check the backend console for any API-related error messages
   - Restart the backend server after updating environment variables

4. **Frontend can't connect to backend**:
   - Verify CORS settings in backend/server.js match your environment
   - Check for any network errors in browser developer tools

5. **Python/ML service errors**:
   - Ensure all Python dependencies are correctly installed
   - Verify that spaCy models have been downloaded
   - Check Python path/environment is correctly set 