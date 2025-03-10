const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, getProfile, updateUserById, deleteUserById } = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", isAdmin, getAllUsers);
router.get("/:id", getUserById);
router.get("/profile/:id", getProfile);
router.put("/:id", updateUserById);
router.delete("/:id", isAdmin, deleteUserById);

module.exports = router;