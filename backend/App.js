const express = require('express');
const cors = require('cors');
const authRoutes = require('./Routes/authRoutes');
const userRoutes = require('./Routes/user');
const prospectRoutes = require('./Routes/prospectRoutes');
const ticketRoutes = require('./Routes/ticket');
const clientRoutes = require('./Routes/clientRoutes'); // Ajout des routes client
const errorHandler = require('./Middleware/errorHandler');

const app = express();

// Middleware CORS
app.use(cors({
  origin: ['http://localhost:3000'], // Ajoute ici d'autres URLs frontend si besoin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Middleware pour parser le JSON
app.use(express.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/prospects', prospectRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/clients', clientRoutes); // Route pour les clients

// Exemple de route tableau de bord
app.get('/api/dashboard', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bienvenue sur le tableau de bord agent'
  });
});

// Gestion des erreurs globales
app.use(errorHandler);

module.exports = app;