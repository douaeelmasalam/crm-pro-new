const mongoose = require('mongoose');

const SubTicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['faible', 'moyenne', 'élevée', 'critique'], required: true },
  status: { type: String, enum: ['ouvert', 'en cours', 'résolu', 'fermé'], default: 'ouvert' },
  clientConcerned: String,
 assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dueDate: Date,
  reminderDate: Date,
  reminderType: String,
  ticketType: String,
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true }
}, { timestamps: true });

module.exports = mongoose.model('SubTicket', SubTicketSchema);
