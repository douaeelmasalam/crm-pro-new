const mongoose = require('mongoose');

// Schéma pour les bilans
const bilanSchema = new mongoose.Schema({
  regimeTVA: {
    type: String,
    enum: ['Réel normal', 'Réel simplifié', 'Franchise en base'],
    default: 'Réel normal'
  },
  regimeIS: {
    type: String,
    enum: ['Réel normal', 'Réel simplifié', 'Micro-BIC', 'Micro-BNC'],
    default: 'Réel normal'
  },
  dateDebut: {
    type: Date,
    default: Date.now
  },
  dateFin: {
    type: Date,
    default: Date.now
  },
  dateEcheance: {
    type: Date,
    default: Date.now
  },
  totale: {
    type: String,
    required: true
  },
  chiffreAffaire: {
    type: String
  },
  resultat: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Schéma pour les organismes
const organismeSchema = new mongoose.Schema({
  nom: {
    type: String,
    enum: ['Impôt', 'URSSAF', 'Net-entreprises'],
    required: true
  },
  siteWeb: {
    type: String
  },
  login: {
    type: String
  },
  motDePasse: {
    type: String
  },
  commentaire: {
    type: String
  }
}, { timestamps: true });

// Schéma pour la fiche client
const ficheClientSchema = new mongoose.Schema({
  paie: {
    type: Boolean,
    default: false
  },
  datePremierBilan: {
    type: Date,
    default: Date.now
  },
  dateDebutMission: {
    type: Date,
    default: Date.now
  },
  dateCulture: {
    type: Date,
    default: Date.now
  },
  regimeTVA: {
    type: String,
    enum: ['Réel normal', 'Réel simplifié', 'Franchise en base'],
    default: 'Réel normal'
  },
  regimeIS: {
    type: String,
    enum: ['Réel normal', 'Réel simplifié', 'Micro-BIC', 'Micro-BNC'],
    default: 'Réel normal'
  },
  jourTVA: {
    type: Date,
    default: Date.now
  },
  typeTVA: {
    type: String,
    enum: ['Débit', 'Encaissement'],
    default: 'Débit'
  },
  dateContrat: {
    type: Date,
    default: Date.now
  },
  dateContratCN2C: {
    type: Date,
    default: Date.now
  },
  compteFiscale: {
    type: Boolean,
    default: false
  }
});

// Schéma principal pour le client - TOUS LES CHAMPS DU FORMULAIRE
const clientSchema = new mongoose.Schema({
  // Champs obligatoires du formulaire
  nom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  
  // Informations de base
  formeJuridique: {
    type: String
  },
  nomCommercial: {
    type: String
  },
  numeroRCS: {
    type: String
  },
  siret: {
    type: String
  },
  codeAPE: {
    type: String
  },
  nomPrenom: {
    type: String
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  manager: {
    type: String
  },
  adresseSiege: {
    type: String
  },
  capitaleSocial: {
    type: String
  },
  dateCloture: {
    type: Date,
    default: Date.now
  },
  inscriptionRM: {
    type: Date,
    default: Date.now
  },
  
  // Sous-schémas
  ficheClient: {
    type: ficheClientSchema,
    default: () => ({})
  },
  bilans: [bilanSchema],
  organismes: [organismeSchema]
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);