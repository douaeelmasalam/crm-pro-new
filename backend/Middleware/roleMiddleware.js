// middleware/roleMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware pour vérifier l'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token d\'accès requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Accès refusé. Privilèges administrateur requis.' 
    });
  }
  next();
};

// Middleware pour vérifier admin ou user
const requireAuth = (req, res, next) => {
  if (!['admin', 'user'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Accès refusé. Rôle non autorisé.' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAuth
};