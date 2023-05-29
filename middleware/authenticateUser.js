const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware function for user authentication
const authenticateUser = async (req, res, next) => {
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Extract the token from the authorization header
    const token = authHeader.split(' ')[1];

    // Verify and decode the token
    const decodedToken = jwt.verify(token, 'my-secret-key'); // Replace 'my-secret-key' with your actual secret key

    // Retrieve the user ID from the decoded token
    const userId = decodedToken.userId;

    // Find the user in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Attach the user object to the request for further use
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = authenticateUser;

