const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUserById, trainAiModel } = require("../controllers/adminController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

router.use(authMiddleware); // Apply authMiddleware to all routes

router.get("/users", isAdmin, getAllUsers);
router.delete("/user/:id", isAdmin, deleteUserById);
router.post("/train-model", isAdmin, trainAiModel);

module.exports = router; 