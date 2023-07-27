const jwt =require("jsonwebtoken")
const verifyToken = (token) => {
    try {
      const decoded = jwt.verify(token, 'abdurrauf');
      return decoded.userId; // Access user ID using decoded.userId
    } catch (error) {
      throw new Error('Invalid or expired token. Authentication failed!');
    }
  };
  
  module.exports = verifyToken;
  