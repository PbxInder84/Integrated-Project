const express = require("express");
const router = express.Router();
const { uploadResume, getResumeById, getAllResumesForUser, deleteResumeById } = require("../controllers/resumeController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Apply authMiddleware to all routes
router.use(authMiddleware);

router.post("/upload", uploadResume);
router.get("/:id", getResumeById);
router.get("/user", getAllResumesForUser);
router.delete("/:id", deleteResumeById);

module.exports = router; 