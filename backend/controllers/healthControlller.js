const axios = require("axios");
const mongoose = require("mongoose");
const { retryMLRequest } = require("../utils/mlServices");

const checkMLService = async () => {
    try {
      const response = await retryMLRequest(`${process.env.PYTHON_API_URL}/models/status`);
      return response.data;
    } catch (error) {
      return { status: 'down', error: error.message };
    }
 };
  
const healthCheck = async (req, res) => {
    const mlStatus = await checkMLService();
    res.json({
      status: 'healthy',
      mlService: mlStatus,
      database: mongoose.connection.readyState === 1
    });
};

module.exports = { healthCheck, checkMLService };