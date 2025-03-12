const dotenv = require("dotenv");
dotenv.config();

const validateEnv = () => {
    const required = ['ML_API_URL', 'MONGO_URI', 'JWT_SECRET_KEY'];
    if(required){
        console.log("ENV Variables are set");
    }    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  };

module.exports = validateEnv;