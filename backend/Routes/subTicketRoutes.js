const express = require('express');
const router = express.Router();
const subTicketController = require('../Controllers/subTicketController');

// Get all subtickets
router.get('/', subTicketController.getAllSubTickets);

// Get all subtickets for a specific ticket
router.get('/ticket/:ticketId', subTicketController.getSubTicketsByTicketId);

// Get a specific subticket by ID
router.get('/:id', subTicketController.getSubTicketById);

// Create a new subticket
router.post('/', subTicketController.createSubTicket);

// Create multiple subtickets
router.post('/batch', subTicketController.createMultipleSubTickets);

// Update a subticket
router.put('/:id', subTicketController.updateSubTicket);

// Delete a subticket
router.delete('/:id', subTicketController.deleteSubTicket);

// Delete all subtickets for a specific ticket
router.delete('/ticket/:ticketId', subTicketController.deleteSubTicketsByTicketId);

module.exports = router;