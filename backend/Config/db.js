const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Utilisation de MONGODB_URI depuis les variables d'environnement
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
