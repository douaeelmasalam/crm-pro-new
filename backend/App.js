const express = require('express');
const cors = require('cors');
const authRoutes = require('./Routes/authRoutes');
const errorHandler = require('./Middleware/errorHandler');
const userRoutes = require('./Routes/user');
const prospectRoutes = require('./Routes/prospectRoutes');

const app = express();

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:3000', // URL de votre frontend
  credentials: true 
}));

// Middleware pour parser le JSON
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/prospects', prospectRoutes);

// Nouvelle route pour le tableau de bord
app.get('/api/dashboard', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bienvenue sur le tableau de bord agent'
  });
});

// Middleware de gestion d'erreurs (à placer en dernier)
app.use(errorHandler);

module.exports = app;