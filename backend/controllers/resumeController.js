const Resume = require("../models/resumeModel");
const AtsScore = require("../models/atsScoreModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require('form-data');

// Configure multer to use memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf" || file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and DOCX are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter
}).single('resume'); // Ensure 'single' is used with the field name

// Upload resume
const uploadResume = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ message: err.message });
    }

    try {
      const filePath = `/public/uploads/resumes/${req.file.originalname}`;
      const resume = await Resume.create({
        userId: req.user.id,
        filename: req.file.originalname,
        fileUrl: filePath
      });

      // Ensure the file is saved to the correct path
      fs.writeFileSync(`${process.cwd()}${filePath}`, req.file.buffer);

      res.status(200).json({ message: "Resume uploaded successfully", resume });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ message: error.message });
    }
  });
};

//get all resumes
const getAllResumesForUser = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id });
    res.status(200).json({ resumes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get resume by id
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.status(200).json({ resume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete resume by id
const deleteResumeById = async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update resume by id
const updateResumeById = async (req, res) => {
  const { id } = req.params;
  const { resume } = req.body;
  try {
    const updatedResume = await Resume.findByIdAndUpdate(id, resume, { new: true });
    if (!updatedResume) {
      return res.status(400).json({ message: "Resume not found" });
    }
    res.status(200).json({ message: "Resume updated successfully", updatedResume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { uploadResume, getAllResumesForUser, getResumeById, deleteResumeById, updateResumeById };
