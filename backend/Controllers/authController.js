const User = require('../Models/User.js');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }

    // Comparer le mot de passe en clair avec celui stocké dans la base de données
    // (assurez-vous que le mot de passe dans la base de données est en texte clair)
    if (password === user.password) {
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
