const mongoose = require('mongoose');

const prospectSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  societe: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  telephone: {
    type: String
  },
  origine: {
    type: String,
    default: 'Cold Call'
  },
  gestionnaire: {
    type: String
  },
  statut: {
    type: String,
    default: 'Nouveau'
  },
  rappel: {
    type: Date
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prospect', prospectSchema);
