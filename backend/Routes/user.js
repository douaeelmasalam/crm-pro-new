const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../Models/User');
const router = express.Router();

// Route pour créer un utilisateur
router.post('/create-user', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validation des champs requis
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création d'un nouvel utilisateur
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
  }
});

// Supprimer un utilisateur par ID
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclure les mots de passe
    res.json(users);
  } catch (err) {
    console.error('Erreur lors du fetch des utilisateurs:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Middleware pour vérifier si l'utilisateur est administrateur
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé' });
  }
};

module.exports = router;