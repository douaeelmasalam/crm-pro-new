const dotenv = require('dotenv');
const connectDB = require('./Config/db'); // <-- Respecte la casse du dossier
const app = require('./App');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();


// Route par défaut
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});