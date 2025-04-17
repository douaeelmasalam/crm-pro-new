require('dotenv').config();
const app = require('./App');
const connectDB = require('./Config/dbConfig');

// Connect to MongoDB
connectDB();

// Define port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

