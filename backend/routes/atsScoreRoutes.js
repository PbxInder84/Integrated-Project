const express = require("express");
const router = express.Router();
const { sendResumeForAtsScore, fetchAtsAnalysisResults } = require("../controllers/atsScoreController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware); // Apply authMiddleware to all routes

router.post("/score", sendResumeForAtsScore);
router.get("/results/:resumeId", fetchAtsAnalysisResults);

module.exports = router; 