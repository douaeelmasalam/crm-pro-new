const express = require('express');
const { login } = require('../Controllers/authController');

const router = express.Router();

// Route for login
router.post('/login', login);

module.exports = router;
