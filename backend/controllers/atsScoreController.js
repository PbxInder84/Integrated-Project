const AtsScore = require("../models/scoreModel");
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
    const formData = new FormData();
    formData.append('resume', fs.createReadStream(resume.fileUrl));
    const atsResult = await axios.post(`${process.env.PYTHON_API_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    const atsScore = await AtsScore.create({
      userId: resume.userId,
      resumeId: resume._id,
      score: atsResult.data.score,
      feedback: atsResult.data.feedback
    });
    res.status(200).json({ message: "Resume analyzed successfully", atsScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch ATS Analysis Results
const fetchAtsAnalysisResults = async (req, res) => {
  try {
    const atsScore = await AtsScore.findOne({ resumeId: req.params.resumeId });
    if (!atsScore) {
      return res.status(404).json({ message: "ATS results not found" });
    }
    res.status(200).json({ atsScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendResumeForAtsScore, fetchAtsAnalysisResults }; 