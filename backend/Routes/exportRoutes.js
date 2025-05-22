const express = require('express');
const router = express.Router();
const exportController = require('../Controllers/exportController');
const authMiddleware = require('../Middleware/authMiddleware');

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Routes pour l'exportation des clients
router.get('/clients/csv', exportController.exportClientsCSV);
router.get('/clients/xlsx', exportController.exportClientsXLSX);
router.get('/clients/json', exportController.exportClientsJSON);

// Routes pour l'exportation des tickets
router.get('/tickets/csv', exportController.exportTicketsCSV);
router.get('/tickets/xlsx', exportController.exportTicketsXLSX);
router.get('/tickets/json', exportController.exportTicketsJSON);

// Routes pour l'exportation des utilisateurs
router.get('/users/csv', exportController.exportUsersCSV);
router.get('/users/xlsx', exportController.exportUsersXLSX);
router.get('/users/json', exportController.exportUsersJSON);

// Routes pour l'exportation des données du dashboard
router.get('/dashboard/csv', exportController.exportDashboardCSV);
router.get('/dashboard/xlsx', exportController.exportDashboardXLSX);
router.get('/dashboard/json', exportController.exportDashboardJSON);

// Routes pour l'exportation des prospects
router.get('/prospects/csv', exportController.exportProspectsCSV);
router.get('/prospects/xlsx', exportController.exportProspectsXLSX);
router.get('/prospects/json', exportController.exportProspectsJSON);

module.exports = router;