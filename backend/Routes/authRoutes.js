const express = require('express');
const router = express.Router();

// Route POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // 👉 Simuler une connexion réussie (tu pourras remplacer ça plus tard)
  res.json({
    message: 'Connexion réussie',
    token: 'fake-token-123',
    role: 'admin',
    userId: 1,
    email
  });
});

module.exports = router;
