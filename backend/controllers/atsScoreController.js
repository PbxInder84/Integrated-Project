const AtsScore = require("../models/atsScoreModel");
const Resume = require("../models/resumeModel");
const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const FormData = require("form-data");

dotenv.config();

// Send Resume for ATS Scoring
const sendResumeForAtsScore = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    
    // Check if ML_API_URL is defined
    const mlApiUrl = process.env.ML_API_URL;
    if (!mlApiUrl) {
      console.error('ML_API_URL is not defined');
      return res.status(500).json({ message: "Internal server error: ML API URL is not configured" });
    }

    // Read the file from disk
    const filePath = `${process.cwd()}${resume.fileUrl}`;
    const formData = new FormData();
    formData.append('resume', fs.createReadStream(filePath));
    
    const atsResult = await axios.post(`${mlApiUrl}/analyze`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    const atsScore = await AtsScore.create({
      userId: resume.userId,
      resumeId: resume._id,
      score: atsResult.data.score,
      feedback: atsResult.data.feedback,
      skills: atsResult.data.skills || []
    });
    
    res.status(200).json({ message: "Resume analyzed successfully", atsScore });
  } catch (error) {
    console.error('ATS Score Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Fetch ATS Analysis Results
const fetchAtsAnalysisResults = async (req, res) => {
  try {
    const atsScore = await AtsScore.findOne({ resumeId: req.params.resumeId });
    if (!atsScore) {
      return res.status(404).json({ message: "ATS score not found for this resume" });
    }
    res.status(200).json({ atsScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAtsResults = async (req, res) => {
  try {
    const atsScore = await AtsScore.findOne({ resumeId: req.params.resumeId });
    if (!atsScore) {
      return res.status(404).json({ message: "ATS score not found for this resume" });
    }
    res.status(200).json({ atsScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendResumeForAtsScore,
  fetchAtsAnalysisResults,
  getAtsResults
}; 