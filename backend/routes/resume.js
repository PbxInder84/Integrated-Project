const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Resume = require('../models/Resume');
const { auth } = require('../middleware/auth');
const { analyzeResumeWithAI } = require('../utils/openai');

const router = express.Router();

// Configure storage for resume files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Set up file filter
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
};

// Initialize upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ML Service URL (should be set in environment variables)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Upload and analyze resume
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Get file details
    const fileType = path.extname(req.file.originalname).toLowerCase().substring(1);
    
    // Create a new resume entry
    const resume = new Resume({
      userId: req.user._id,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileType,
      status: 'pending'
    });
    
    await resume.save();
    
    // Send file to ML service for analysis
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/analyze`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      // Update resume with analysis results
      resume.parsedContent = {
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        education: response.data.education || [],
        skills: response.data.skills || []
      };
      
      resume.analysis = {
        score: response.data.score || 0,
        feedback: response.data.feedback || []
      };
      
      // Add first entry to analysis history
      resume.analysisHistory = [{
        date: new Date(),
        score: response.data.score || 0
      }];
      
      resume.status = 'processed';
      await resume.save();
      
      res.json({
        id: resume._id,
        fileName: resume.originalFileName,
        parseData: resume.parsedContent,
        analysis: resume.analysis
      });
    } catch (error) {
      console.error('ML Service Error:', error.message);
      
      // Update status to error if ML service fails
      resume.status = 'error';
      await resume.save();
      
      throw new Error('Failed to analyze resume: ' + (error.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Resume Upload Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get user's resume history
router.get('/history', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(resumes.map(resume => ({
      id: resume._id,
      fileName: resume.originalFileName,
      uploadDate: resume.createdAt,
      status: resume.status,
      score: resume.analysis?.score
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific resume by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json({
      id: resume._id,
      fileName: resume.originalFileName,
      uploadDate: resume.createdAt,
      lastAnalyzed: resume.lastAnalyzed,
      status: resume.status,
      parseData: resume.parsedContent,
      analysis: resume.analysis,
      analysisHistory: resume.analysisHistory || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a resume
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Delete the file from storage
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }
    
    // Delete from database - using deleteOne instead of remove()
    await Resume.deleteOne({ _id: resume._id });
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Resume Delete Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Re-analyze an existing resume
router.post('/:id/reanalyze', auth, async (req, res) => {
  try {
    // Find the resume by ID and user ID
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Check if file exists
    if (!fs.existsSync(resume.filePath)) {
      return res.status(400).json({ error: 'Resume file not found in storage' });
    }
    
    // Send file to ML service for re-analysis
    const formData = new FormData();
    formData.append('file', fs.createReadStream(resume.filePath));
    
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/analyze`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      const newScore = response.data.score || 0;
      
      // Update resume with new analysis results
      resume.parsedContent = {
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        education: response.data.education || [],
        skills: response.data.skills || []
      };
      
      resume.analysis = {
        score: newScore,
        feedback: response.data.feedback || []
      };
      
      // Add new entry to analysis history
      if (!resume.analysisHistory) {
        resume.analysisHistory = [];
      }
      
      resume.analysisHistory.push({
        date: new Date(),
        score: newScore
      });
      
      resume.status = 'processed';
      resume.lastAnalyzed = new Date(); // Add last analyzed timestamp
      await resume.save();
      
      res.json({
        id: resume._id,
        fileName: resume.originalFileName,
        uploadDate: resume.createdAt,
        lastAnalyzed: resume.lastAnalyzed,
        status: resume.status,
        parseData: resume.parsedContent,
        analysis: resume.analysis,
        analysisHistory: resume.analysisHistory
      });
    } catch (error) {
      console.error('ML Service Error during re-analysis:', error.message);
      
      // Update status to error if ML service fails
      resume.status = 'error';
      await resume.save();
      
      throw new Error('Failed to re-analyze resume: ' + (error.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Resume Re-analysis Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get AI-powered analysis for a resume
router.post('/:id/ai-analysis', auth, async (req, res) => {
  try {
    // Find the resume by ID and user ID
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    if (resume.status !== 'processed') {
      return res.status(400).json({ error: 'Resume must be processed before AI analysis' });
    }
    
    try {
      // Include the resume ID in the data passed to the OpenAI utility
      const resumeWithId = {
        ...resume.toObject(),
        id: resume._id.toString() // Ensure ID is included as string
      };
      
      // Perform AI analysis
      const aiAnalysisResult = await analyzeResumeWithAI(resumeWithId);
      
      // Update resume with AI analysis
      resume.aiAnalysis = {
        ...aiAnalysisResult,
        lastUpdated: new Date()
      };
      
      await resume.save();
      
      res.json({
        id: resume._id,
        aiAnalysis: resume.aiAnalysis
      });
    } catch (error) {
      console.error('AI Analysis Error:', error.message);
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    console.error('Resume AI Analysis Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 