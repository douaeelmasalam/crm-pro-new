const mongoose = require('mongoose');

// Schema pour les organismes
const OrganismeSchema = new mongoose.Schema({
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

// Schema pour les bilans
const BilanSchema = new mongoose.Schema({
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
    required: true
  },
  dateFin: {
    type: Date,
    required: true
  },
  dateEcheance: {
    type: Date
  },
  totale: {
    type: String
  },
  chiffreAffaire: {
    type: String
  },
  resultat: {
    type: String
  }
}, { timestamps: true });

// Schema pour les fiches client
const FicheClientSchema = new mongoose.Schema({
  paie: {
    type: Boolean,
    default: false
  },
  datePremierBilan: {
    type: Date
  },
  dateDebutMission: {
    type: Date
  },
  dateCulture: {
    type: Date
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
    type: Date
  },
  typeTVA: {
    type: String,
    enum: ['Débit', 'Encaissement'],
    default: 'Débit'
  },
  dateContrat: {
    type: Date
  },
  dateContratCN2C: {
    type: Date
  },
  compteFiscale: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Schema principal pour le client
const ClientSchema = new mongoose.Schema({
  // Informations de base
  formeJuridique: {
    type: String,
    required: true
  },
  numeroRCS: {
    type: String
  },
  codeAPE: {
    type: String
  },
  nomPrenom: {
    type: String,
    required: true
  },
  nomCommercial: {
    type: String
  },
  manager: {
    type: String
  },
  dateCreation: {
    type: Date
  },
  adresseSiege: {
    type: String
  },
  dateCloture: {
    type: Date
  },
  siret: {
    type: String,
    unique: true,
    sparse: true
  },
  capitaleSocial: {
    type: String
  },
  inscriptionRM: {
    type: Date
  },
  
  // Relations avec les autres schémas
  ficheClient: FicheClientSchema,
  bilans: [BilanSchema],
  organismes: [OrganismeSchema],
  
  // Champ pour lier à un utilisateur (si nécessaire)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);