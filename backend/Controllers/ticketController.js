const Ticket = require('../Models/Ticket');

// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { title, description, priority, clientConcerned, assignedUser, status } = req.body;
    
    const newTicket = new Ticket({
      title,
      description,
      priority,
      clientConcerned,
      assignedUsers: [assignedUser], // Stocké comme tableau
      status: status || 'open',
    });
        
    const savedTicket = await newTicket.save();
    res.status(201).json({ message: 'Ticket créé avec succès', ticket: savedTicket });
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    res.status(500).json({ message: 'Erreur lors de la création du ticket.' });
  }
};

// Get all tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 }); // Sort by creation date, newest first
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
};

// Get a single ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Error fetching ticket' });
  }
};

// Update a ticket
exports.updateTicket = async (req, res) => {
  try {
    const { title, description, priority, clientConcerned, assignedUser, status } = req.body;
    
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        priority,
        clientConcerned,
        assignedUser,
        status,
        updatedAt: Date.now()
      },
      { new: true } // Return the updated document
    );
    
    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.status(200).json({ message: 'Ticket updated successfully', ticket: updatedTicket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Error updating ticket' });
  }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
  try {
    const deletedTicket = await Ticket.findByIdAndDelete(req.params.id);
    
    if (!deletedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Error deleting ticket' });
  }
};

// Get tickets by status
exports.getTicketsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status
    const validStatuses = ['open', 'in-progress', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status parameter' });
    }
    
    const tickets = await Ticket.find({ status }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets by status:', error);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
};

// Get tickets by priority
exports.getTicketsByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    
    // Validate priority
    const validPriorities = ['faible', 'moyenne', 'élevée', 'critique'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority parameter' });
    }
    
    const tickets = await Ticket.find({ priority }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets by priority:', error);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
};

// Get tickets assigned to a specific user
exports.getTicketsByAssignee = async (req, res) => {
  try {
    const { username } = req.params;
    
    const tickets = await Ticket.find({ assignedUser: username }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets by assignee:', error);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
};

// Get tickets for a specific client
exports.getTicketsByClient = async (req, res) => {
  try {
    const { client } = req.params;
    
    const tickets = await Ticket.find({ clientConcerned: client }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets by client:', error);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
};

// Search tickets
exports.searchTickets = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const tickets = await Ticket.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { clientConcerned: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error searching tickets:', error);
    res.status(500).json({ message: 'Error searching tickets' });
  }
};