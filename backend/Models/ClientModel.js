const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  project: {
    type: String,
    required: true
  },
  tracker: {
    type: String,
    default: 'Fiche client'
  },
  subject: {
    type: String,
    default: 'FICHE CLIENT 2025'
  },
  description: {
    type: String,
    default: 'Modifier'
  },
  status: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    default: 'Normal'
  },
  assignedTo: {
    type: String
  },
  targetVersion: {
    type: String
  },
  parentTask: {
    type: String
  },
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  estimatedTime: {
    type: Number,
    default: 0
  },
  percentDone: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Client Information
  clientContactName: {
    type: String
  },
  activity: {
    type: String
  },
  clientEmail: {
    type: String,
    required: true
  },
  clientPhone: {
    type: String,
    default: 'À RENSEIGNER'
  },
  siretNumber: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  creationDate: {
    type: Date
  },
  closureDate: {
    type: Date
  },
  firstBalanceDate: {
    type: Date
  },
  // Fiscalité
  vatType: {
    type: String,
    enum: ['CA3 Mensuelle', 'CA3 Trimestrielle', 'CA12 Annuelle', 'Franchise de taxe', '']
  },
  vatNumber: {
    type: String
  },
  vatDate: {
    type: Date
  },
  // Régimes et Données Financières
  urssafRegime: {
    type: String,
    default: 'Indépendant'
  },
  taxationRegime: {
    type: String,
    default: 'Réel simplifié'
  },
  cn2cDebt: {
    type: Number,
    default: 0
  },
  keyManageDebt: {
    type: Number,
    default: 0
  },
  legalStatus: {
    type: String,
    default: 'SARL'
  },
  generalObservations: {
    type: String
  },
  // Other Information
  paymentRejection: {
    type: String
  },
  fiscalAccount: {
    type: String
  },
  subscriptionClient: {
    type: String
  },
  cn2cContract: {
    type: String
  },
  cn2cContractDate: {
    type: Date
  },
  keymanageContract: {
    type: String
  },
  keymanageContractDate: {
    type: Date
  }
}, {
  timestamps: true
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;