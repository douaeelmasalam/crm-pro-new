const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Accès refusé, aucun token' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Assure-toi d’avoir cette variable dans .env
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token invalide' });
  }
};

module.exports = authenticateToken;
