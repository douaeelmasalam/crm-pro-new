const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../Models/User');
const router = express.Router();

// ✅ Créer un utilisateur
router.post('/create-user', async (req, res) => {
  const { name, email, password, role, status } = req.body; // ✅ Ajout du status

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      status: status || 'Actif' // ✅ Gestion du statut
    });
    await newUser.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
  }
});

// ✅ Supprimer un utilisateur
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

// ✅ Obtenir tous les utilisateurs (sans mot de passe)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Erreur lors du fetch des utilisateurs:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Obtenir un utilisateur par ID (exclut le mot de passe)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Mettre à jour un utilisateur par ID (inclut le statut)
router.put('/:id', async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body; // ✅ Ajout du status
    const updateData = { name, email, role };

    // ✅ Gestion du statut
    if (status) {
      updateData.status = status;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur mis à jour avec succès', user });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Route spécifique pour mettre à jour uniquement le statut
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Le statut est requis' });
    }

    const validStatuses = ['Actif', 'Inactif', 'En attente de validation', 'Suspendu', 'Supprimé'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Statut mis à jour avec succès', user });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du statut:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Middleware pour l'accès admin (optionnel pour protéger des routes)
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé' });
  }
};

module.exports = router;