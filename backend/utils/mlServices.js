const axios = require("axios");

const retryMLRequest = async (url, data, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await axios.post(url, data);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

module.exports = { retryMLRequest };