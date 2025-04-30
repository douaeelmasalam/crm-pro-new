const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['faible', 'moyenne', 'élevée', 'critique'], required: true },
  status: { type: String, enum: ['ouvert', 'en cours', 'résolu', 'fermé'], default: 'ouvert' },
  clientConcerned: { type: String, required: true },
  assignedUsers: [{ type: String }], // Changed to array to support multiple assignees
  dueDate: { type: Date },           // Added dueDate field
  reminderDate: { type: Date },      // Added reminderDate field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;