const express = require('express');
const router = express.Router();
const ticketController = require('../Controllers/ticketController');

// Create and get all tickets
router.post('/', ticketController.createTicket);
router.get('/', ticketController.getAllTickets);

// Get, update, delete a specific ticket
router.get('/:id', ticketController.getTicketById);
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

// Filter tickets by different criteria
router.get('/status/:status', ticketController.getTicketsByStatus);
router.get('/priority/:priority', ticketController.getTicketsByPriority);
router.get('/assignee/:username', ticketController.getTicketsByAssignee);
router.get('/client/:client', ticketController.getTicketsByClient);

// Search tickets
router.get('/search', ticketController.searchTickets);

module.exports = router;