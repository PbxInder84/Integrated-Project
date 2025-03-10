const express = require("express");
const router = express.Router();
const { healthCheck, checkMLService } = require("../controllers/healthControlller");

router.get("/health", healthCheck);
router.get("/health-ml", checkMLService);

module.exports = router;
