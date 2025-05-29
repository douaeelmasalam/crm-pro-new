const express = require('express');
const router = express.Router();
const clientController = require('../Controllers/clientController'); // Assurez-vous du bon chemin

// =================== ROUTES PRINCIPALES ===================

// GET /api/clients - Récupérer tous les clients
router.get('/', clientController.getAllClients);

// GET /api/clients/select - Pour les select (react-select)
router.get('/select', clientController.getClientsForSelect);

// GET /api/clients/:id - Récupérer un client par ID
router.get('/:id', clientController.getClientById);

// POST /api/clients - Créer un nouveau client (ROUTE PRINCIPALE)
router.post('/', clientController.createClient);

// PUT /api/clients/:id - Mettre à jour un client
router.put('/:id', clientController.updateClient);

// DELETE /api/clients/:id - Supprimer un client
router.delete('/:id', clientController.deleteClient);

// =================== ROUTES SPÉCIALISÉES ===================

// POST /api/clients/:id/bilans - Ajouter un bilan
router.post('/:id/bilans', clientController.addBilan);

// POST /api/clients/:id/organismes - Ajouter un organisme
router.post('/:id/organismes', clientController.addOrganisme);

// =================== MIDDLEWARE DE DEBUG (Optionnel) ===================
// Middleware pour logger toutes les requêtes (à placer en premier)
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

module.exports = router;