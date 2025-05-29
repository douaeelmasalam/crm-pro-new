const express = require('express');
const router = express.Router();
const exportController = require('../Controllers/exportController');
const authMiddleware = require('../Middleware/authMiddleware');

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Middleware de validation des paramètres
const validateExportParams = (req, res, next) => {
  const { exportType, format } = req.params;
  const { startDate, endDate } = req.query;
  
  // Validation des types et formats supportés
  const supportedTypes = ['clients', 'tickets', 'users', 'dashboard', 'prospects'];
  const supportedFormats = ['csv', 'xlsx', 'json'];
  
  if (!supportedTypes.includes(exportType)) {
    return res.status(400).json({ 
      message: `Type d'export non supporté: ${exportType}. Types disponibles: ${supportedTypes.join(', ')}` 
    });
  }
  
  if (!supportedFormats.includes(format)) {
    return res.status(400).json({ 
      message: `Format non supporté: ${format}. Formats disponibles: ${supportedFormats.join(', ')}` 
    });
  }
  
  // Validation des dates si fournies
  if (startDate && !Date.parse(startDate)) {
    return res.status(400).json({ message: 'Format de date de début invalide' });
  }
  
  if (endDate && !Date.parse(endDate)) {
    return res.status(400).json({ message: 'Format de date de fin invalide' });
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ message: 'La date de début doit être antérieure à la date de fin' });
  }
  
  next();
};

// Route dynamique avec validation
router.get('/:exportType/:format', validateExportParams, async (req, res) => {
  const { exportType, format } = req.params;
  
  try {
    // Mapping des fonctions d'export
    const exportFunctions = {
      clients: {
        csv: exportController.exportClientsCSV,
        xlsx: exportController.exportClientsXLSX,
        json: exportController.exportClientsJSON
      },
      tickets: {
        csv: exportController.exportTicketsCSV,
        xlsx: exportController.exportTicketsXLSX,
        json: exportController.exportTicketsJSON
      },
      users: {
        csv: exportController.exportUsersCSV,
        xlsx: exportController.exportUsersXLSX,
        json: exportController.exportUsersJSON
      },
      dashboard: {
        csv: exportController.exportDashboardCSV,
        xlsx: exportController.exportDashboardXLSX,
        json: exportController.exportDashboardJSON
      },
      prospects: {
        csv: exportController.exportProspectsCSV,
        xlsx: exportController.exportProspectsXLSX,
        json: exportController.exportProspectsJSON
      }
    };

    // Appeler la fonction d'export correspondante
    const exportFunction = exportFunctions[exportType][format];
    await exportFunction(req, res);

  } catch (error) {
    console.error(`Erreur lors de l'exportation ${exportType} en ${format}:`, error);
    
    // Ne pas exposer les détails d'erreur en production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Erreur serveur lors de l\'exportation';
      
    res.status(500).json({ 
      message: errorMessage,
      exportType,
      format
    });
  }
});

// Route pour obtenir les métadonnées d'export disponibles
router.get('/metadata/types', (req, res) => {
  res.json({
    supportedTypes: ['clients', 'tickets', 'users', 'dashboard', 'prospects'],
    supportedFormats: ['csv', 'xlsx', 'json'],
    filters: {
      clients: ['startDate', 'endDate', 'status'],
      tickets: ['startDate', 'endDate', 'status', 'priority'],
      users: ['role'],
      dashboard: ['startDate', 'endDate'],
      prospects: ['startDate', 'endDate', 'status']
    }
  });
});

module.exports = router;