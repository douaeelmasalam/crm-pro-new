const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} = require('../Controllers/clientController');

// Get all clients
router.get('/', getClients);

// Get client by ID
router.get('/:id', getClientById);

// Create new client
router.post('/', createClient);

// Update client
router.put('/:id', updateClient);

// Delete client
router.delete('/:id', deleteClient);

module.exports = router;