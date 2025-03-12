const express = require("express");
const router = express.Router();
const { sendResumeForAtsScore, fetchAtsAnalysisResults } = require("../controllers/atsScoreController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware);

// Combine all ATS-related routes here
router.get("/results/:resumeId", fetchAtsAnalysisResults);
router.post("/score/:resumeId", sendResumeForAtsScore);

module.exports = router; 