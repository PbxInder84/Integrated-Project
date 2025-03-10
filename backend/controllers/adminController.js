const User = require("../models/userModel");
const Resume = require("../models/resumeModel");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

// Fetch All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a User
const deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await Resume.deleteMany({ userId: user._id });
    await user.remove();
    res.status(200).json({ message: "User and associated resumes deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Train AI Model
const trainAiModel = async (req, res) => {
  try {
    const response = await axios.post(`${process.env.PYTHON_API_URL}/train`);
    res.status(200).json({ message: "Machine Learning model training started.", status: response.data.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, deleteUserById, trainAiModel }; 