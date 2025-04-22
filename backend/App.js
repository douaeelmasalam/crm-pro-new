const express = require('express');
const cors = require('cors');
const authRoutes = require('./Routes/authRoutes');
const errorHandler = require('./Middleware/errorHandler');
const userRoutes = require('./Routes/user');
const prospectRoutes = require('./Routes/prospectRoutes'); // Add this import

const app = express();

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:3000', // ou l'URL où est votre frontend
  credentials: true
}));

// Middleware pour parser le JSON
app.use(express.json());

// Routes existantes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/prospects', prospectRoutes); // Add this line

// Route directe pour le login (compatibilité)
const { login } = require('./Controllers/authController');
app.post('/login', login);

// Nouvelle route pour le tableau de bord
app.get('/api/dashboard', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Bienvenue sur le tableau de bord agent'
  });
});

// Middleware de gestion d'erreurs (doit être en dernier)
app.use(errorHandler);

module.exports = app;