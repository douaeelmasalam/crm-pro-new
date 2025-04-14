const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: String // Add role field
});

const User = mongoose.model('User', userSchema, 'users');
module.exports = User;