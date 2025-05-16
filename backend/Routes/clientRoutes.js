const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const clientController = require('../Controllers/clientController');
const authMiddleware = require('../Middleware/authMiddleware');

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Récupérer tous les clients
router.get('/', clientController.getAllClients);

// Récupérer un client par ID
router.get('/:id', clientController.getClientById);

// Créer un nouveau client avec validation
router.post('/', [
  check('formeJuridique', 'La forme juridique est requise').not().isEmpty(),
  check('nomPrenom', 'Le nom et prénom sont requis').not().isEmpty(),
  // Ajouter d'autres validations selon les besoins
], clientController.createClient);

// Mettre à jour un client
router.put('/:id', clientController.updateClient);

// Supprimer un client
router.delete('/:id', clientController.deleteClient);

// Ajouter un bilan à un client
router.post('/:id/bilans', clientController.addBilan);

// Ajouter un organisme à un client
router.post('/:id/organismes', clientController.addOrganisme);

// Mettre à jour la fiche client
router.put('/:id/fiche-client', clientController.updateFicheClient);

module.exports = router;