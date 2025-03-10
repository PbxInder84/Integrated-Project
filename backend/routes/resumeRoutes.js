const express = require("express");
const router = express.Router();
const { uploadResume, getResumeById, getAllResumesForUser, deleteResumeById, sendResumeForAtsScore } = require("../controllers/resumeController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware); // Apply authMiddleware to all routes

router.post("/upload", uploadResume);
router.get("/:id", getResumeById);
router.get("/user", getAllResumesForUser);
router.delete("/:id", deleteResumeById);
router.post("/analyze/:id", sendResumeForAtsScore);

module.exports = router; 