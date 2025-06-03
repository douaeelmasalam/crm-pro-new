// backend/models/Document.js
const mongoose = require('mongoose'); // Cette ligne manquait

const DocumentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
}, { collection: 'documents' });

module.exports = mongoose.model('Document', DocumentSchema);