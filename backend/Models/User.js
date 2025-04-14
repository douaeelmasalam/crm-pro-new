const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Le nom est obligatoire
  },
  email: {
    type: String,
    required: true,
    unique: true, // L'email doit être unique
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Les rôles disponibles
    default: 'user',
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
