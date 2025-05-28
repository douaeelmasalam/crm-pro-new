// Models/Ticket.js
const mongoose = require('mongoose');


// Update the main ticket schema
const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['faible', 'moyenne', 'élevée', 'critique'], required: true },
  status: { type: String, enum: ['ouvert', 'en cours', 'résolu', 'fermé'], default: 'ouvert' },
  clientConcerned: { type: String },
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dueDate: { type: Date },
  reminderDate: { type: Date },
  reminderType: { type: String, enum: ['email', 'telephone'], default: 'email' },
  ticketSource: { type: String, enum: ['email', 'telephone', 'chat', 'formulaire'], default: 'email' },
  ticketType: { type: String, enum: ['bug', 'feature', 'support', 'question', 'autre', ''] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update the updatedAt field
ticketSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;