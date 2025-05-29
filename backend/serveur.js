// server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./Config/db');

// Importation des routes
const authRoutes = require('./Routes/authRoutes');
const userRoutes = require('./Routes/user');
const prospectRoutes = require('./Routes/prospectRoutes');
const ticketRoutes = require('./Routes/ticket');
const subTicketRoutes = require('./Routes/subTicketRoutes');
const clientRoutes = require('./Routes/clientRoutes');
const exportRoutes = require('./Routes/exportRoutes');

// Middleware de gestion des erreurs
const errorHandler = require('./Middleware/errorHandler');

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application
const app = express();

// Middleware CORS
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log des requêtes en développement
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/prospects', prospectRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/subtickets', subTicketRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/export', exportRoutes);

// Route tableau de bord
app.get('/api/dashboard', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bienvenue sur le tableau de bord agent'
  });
});

// Route racine
app.get('/', (req, res) => {
  res.send('API est en ligne');
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint non trouvé' 
  });
});

// Middleware de gestion des erreurs globales
app.use(errorHandler);

// Middleware fallback pour erreurs non capturées
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Connexion à la base de données et démarrage du serveur
const PORT = process.env.PORT || 5000;

// Utilisation de la fonction connectDB existante
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(error => {
  console.error('Erreur de connexion à MongoDB:', error.message);
  process.exit(1);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('Erreur non gérée:', err.message);
  // Fermeture propre du serveur
  process.exit(1);
});