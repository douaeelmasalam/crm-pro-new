const jwt = require('jsonwebtoken');
const SECRET_KEY = 'votre_clé_secrète';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  if (!token) return res.sendStatus(401); // non autorisé

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // token invalide
    req.user = user; // Injecter user (ex: { id, role })
    next();
  });
};

module.exports = authenticateToken;
