const User = require('../Models/User.js');

const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }
    
    // Compare the provided password with the stored password
    if (password === user.password) {
      // Send back user role along with success message
      res.status(200).json({
        message: 'Login successful!',
        role: user.role  // Include the user's role
      });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Error during login.');
  }
};

module.exports = {
  login
};