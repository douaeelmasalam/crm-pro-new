const express = require('express');
const Router = express.Router();
const { login } = require('../Controllers/authController');

const router = express.Router();

// Route for login
router.post('/login', login);

module.exports = router;