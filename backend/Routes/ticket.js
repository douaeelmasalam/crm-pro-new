// Routes/ticket.js
const express = require('express');
const router = express.Router();
const ticketController = require('../Controllers/ticketController');
const authMiddleware = require('../Middleware/authMiddleware'); // <-- ajout nécessaire

// Create and get all tickets
router.post('/', ticketController.createTicket);
router.get('/', ticketController.getAllTickets);

// Create batch of subtickets for a ticket
router.post('/subtickets/batch', ticketController.createSubtickets);

// Get, update, delete a specific ticket
router.get('/:id', ticketController.getTicketById);
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

// Update only the status of a ticket (for Kanban functionality)
router.post('/:id/status', ticketController.updateTicket);

// Filter tickets by different criteria
router.get('/status/:status', ticketController.getTicketsByStatus);
router.get('/priority/:priority', ticketController.getTicketsByPriority);
router.get('/assignee/:username', ticketController.getTicketsByAssignee);
router.get('/client/:client', ticketController.getTicketsByClient);
router.get('/source/:source', ticketController.getTicketsBySource);
router.get('/type/:type', ticketController.getTicketsByType);

// Search tickets
router.get('/search', ticketController.searchTickets);


// Route pour récupérer les tickets assignés à un agent spécifique
router.get('/assigned/:userId', authMiddleware, ticketController.getTicketsAssignedToUser);

// Subticket routes
router.put('/:ticketId/subtickets/:subticketId', ticketController.updateSubticket);
router.delete('/:ticketId/subtickets/:subticketId', ticketController.deleteSubticket);

module.exports = router;
