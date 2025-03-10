const Resume = require("../models/resumeModel");
const multer = require("multer");
const path = require("path");
const User = require("../models/userModel");

//multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads/resumes"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('resume');

//upload resume
const uploadResume = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    try {
      const resume = await Resume.create({
        userId: req.user.id,
        filename: req.file.filename,
        fileUrl: `/uploads/resumes/${req.file.filename}`
      });
      res.status(200).json({ message: "Resume uploaded successfully", resume });
    } catch (error) {
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
