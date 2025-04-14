const express = require('express');
const cors = require('cors');
const authRoutes = require('./Routes/authRoutes');
const errorHandler = require('./Middleware/errorHandler');
const userRoutes = require('./Routes/user');
const app = express();

app.use(cors());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(userRoutes);
app.use('/api/auth', authRoutes);


const { login } = require('./Controllers/authController');
app.post('/login', login); // Route directe pour la compatibilité

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));

// Use routes
app.use('/api/auth', authRoutes);

// Use error handler middleware
app.use(errorHandler);

module.exports = app;