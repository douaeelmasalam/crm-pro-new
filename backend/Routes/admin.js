const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Models/User'); // Ajustez le chemin selon votre structure
const Ticket = require('../Models/Ticket');
const Prospect = require('../Models/Prospect');
const Document = require('../Models/Document');
const Client = require('../Models/Client');

// Middleware d'authentification
const authenticateToken = require('../middlewares/auth');
const { requireAdmin, requireAuth } = require('../Middleware/roleMiddleware');

// Middleware admin existant (si vous l'avez déjà défini)
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  next();
};

// Routes accessibles à tous les utilisateurs authentifiés (admin + user)
router.get('/dashboard', authenticateToken, requireAuth, (req, res) => {
  // Dashboard principal - accessible aux deux rôles
  res.json({ message: 'Dashboard data', userRole: req.user.role });
});

router.get('/tickets', authenticateToken, requireAuth, async (req, res) => {
  try {
    let tickets;
    if (req.user.role === 'admin') {
      // Admin voit tous les tickets
      tickets = await Ticket.find();
    } else {
      // User voit seulement ses tickets ou tickets assignés
      tickets = await Ticket.find({ 
        $or: [
          { createdBy: req.user.userId },
          { assignedTo: req.user.userId }
        ]
      });
    }
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/prospects', authenticateToken, requireAuth, async (req, res) => {
  try {
    let prospects;
    if (req.user.role === 'admin') {
      prospects = await Prospect.find();
    } else {
      // User voit seulement ses prospects
      prospects = await Prospect.find({ assignedTo: req.user.userId });
    }
    res.json(prospects);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/documents', authenticateToken, requireAuth, async (req, res) => {
  try {
    let documents;
    if (req.user.role === 'admin') {
      documents = await Document.find();
    } else {
      // User voit documents publics + ses documents
      documents = await Document.find({
        $or: [
          { isPublic: true },
          { createdBy: req.user.userId }
        ]
      });
    }
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Routes réservées aux admins uniquement
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de création d'utilisateur (votre code original intégré)
router.post('/create-user', authenticateToken, isAdmin, async (req, res) => {
  const { email, password, role } = req.body;
  
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Champs manquants' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès !' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la création' });
  }
});

router.post('/create-ticket', authenticateToken, requireAdmin, async (req, res) => {
  // Seuls les admins peuvent créer des tickets
  try {
    const newTicket = new Ticket({
      ...req.body,
      createdBy: req.user.userId
    });
    await newTicket.save();
    res.status(201).json({ message: 'Ticket créé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/clients', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;