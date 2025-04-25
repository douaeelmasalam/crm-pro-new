// index.js
require('dotenv').config(); // Charge les variables d'environnement depuis .env
const app = require('./App'); // Import de l'application Express
const connectDB = require('./config/db'); // Connexion MongoDB

// Connexion à la base de données
connectDB();

// Définition du port
const PORT = process.env.PORT || 5000;

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
