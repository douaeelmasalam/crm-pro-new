const bcrypt = require('bcrypt');
const User = require('../Models/User.js');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }

    // Comparer le mot de passe en clair avec le mot de passe haché
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // Connexion réussie
      res.status(200).json({ message: 'Login successful!', role: user.role });
    } else {
      // Mot de passe incorrect
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Error during login.');
  }
};

module.exports = { login };
