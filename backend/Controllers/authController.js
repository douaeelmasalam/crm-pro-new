// const bcrypt = require('bcrypt');
// const User = require('../Models/User.js');

// const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Rechercher l'utilisateur par email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).send('Invalid credentials');
//     }

//     // Comparer le mot de passe en clair avec le mot de passe haché
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (isMatch) {
//       // Connexion réussie
//       res.status(200).json({ message: 'Login successful!', role: user.role });
//     } else {
//       // Mot de passe incorrect
//       res.status(401).send('Invalid credentials');
//     }
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).send('Error during login.');
//   }
// };

// module.exports = { login };


const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../Models/User.js');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('[LOGIN] Tentative de connexion avec :', email);

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('[LOGIN] Utilisateur introuvable');
      return res.status(401).send('Invalid credentials');
    }

    // Comparer le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('[LOGIN] Mot de passe incorrect');
      return res.status(401).send('Invalid credentials');
    }

    // Créer un token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('[LOGIN] Connexion réussie pour :', user.email);
    console.log('[LOGIN] Token généré :', token);
console.log('[LOGIN] Données renvoyées au frontend :', {
  message: 'Login successful!',
  token,
  role: user.role,
  userId: user._id,
  email: user.email
});
    res.status(200).json({
      
      message: 'Login successful!',
      token,
      role: user.role,
      userId: user._id,
      email: user.email
    });

  } catch (error) {
    console.error('[LOGIN] Erreur serveur :', error);
    res.status(500).send('Error during login.');
  }
};

module.exports = { login };
