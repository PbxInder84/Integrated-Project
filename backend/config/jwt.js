const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

const generateToken = (user) => {
  return jwt.sign(user, secretKey, { expiresIn: process.env.JWT_EXPIRES_IN });
};

module.exports = { generateToken };
