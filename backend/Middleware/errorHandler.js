const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: messages,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }

  // Erreurs de duplication Mongoose
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Une valeur unique existe déjà dans la base de données',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }

  // Erreurs de cast (ID invalide, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Ressource non trouvée',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }

  // Autres erreurs
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Erreur serveur',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
