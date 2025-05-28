const SubTicket = require('../Models/SubTicket');

// Get all subtickets
exports.getAllSubTickets = async (req, res) => {
  try {
    const subtickets = await SubTicket.find().populate('assignedUsers', 'name username');
    res.status(200).json(subtickets);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des sous-tickets', 
      error: error.message 
    });
  }
};

// Get a single subticket by ID
exports.getSubTicketById = async (req, res) => {
  try {
    const subticket = await SubTicket.findById(req.params.id).populate('assignedUsers', 'name username');
    
    if (!subticket) {
      return res.status(404).json({ message: 'Sous-ticket non trouvé' });
    }
    
    res.status(200).json(subticket);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du sous-ticket', 
      error: error.message 
    });
  }
};


// Get all subtickets for a specific ticket
exports.getSubTicketsByTicketId = async (req, res) => {
  try {
    const subtickets = await SubTicket.find({ ticketId: req.params.ticketId }).populate('assignedUsers', 'name username');
    res.status(200).json(subtickets);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des sous-tickets', 
      error: error.message 
    });
  }
};


// Create a new subticket
exports.createSubTicket = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      ticketId,
      status,
      clientConcerned,
      assignedUsers,
      dueDate,
      reminderDate,
      reminderType,
      ticketType 
       } = req.body;

      const subticket = new SubTicket({
      title,
      description, 
      priority: priority || 'faible',
      status: status || 'ouvert',
      ticketId,
      clientConcerned,
      assignedUsers: assignedUsers || [],
      dueDate,
      reminderDate,
      reminderType: reminderType || 'email',
      ticketType
    });
    
  const savedSubticket = await subticket.save();
    
    res.status(201).json({
      message: 'Sous-ticket créé avec succès',
      subticket: savedSubticket
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la création du sous-ticket', 
      error: error.message 
    });
  }
};

// Create multiple subtickets
exports.createMultipleSubTickets = async (req, res) => {
  try {
    const { subtickets, ticketId } = req.body;
    
    if (!subtickets || !Array.isArray(subtickets) || subtickets.length === 0) {
      return res.status(400).json({ message: 'Aucun sous-ticket fourni' });
    }
    
   const subticketDocuments = subtickets.map(subticket => ({
  title: subticket.title,
  description: subticket.description,
  priority: subticket.priority || 'faible',
  clientConcerned: subticket.clientConcerned,
  assignedUsers: subticket.assignedUsers || [],
  status: subticket.status || 'ouvert',
  dueDate: subticket.dueDate,
  reminderDate: subticket.reminderDate,
  reminderType: subticket.reminderType,
  ticketType: subticket.ticketType,
  ticketId
}));
    
    const savedSubtickets = await SubTicket.insertMany(subticketDocuments);
    
    res.status(201).json({
      message: `${savedSubtickets.length} sous-ticket(s) créé(s) avec succès`,
      subtickets: savedSubtickets
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la création des sous-tickets', 
      error: error.message 
    });
  }
};

// Update a subticket
exports.updateSubTicket = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      status,
      clientConcerned,
      assignedUsers,
      dueDate,
      reminderDate,
      reminderType,
      ticketType
    } = req.body;
    console.log("Received update for subticket:", req.body);

    const subticket = await SubTicket.findById(req.params.id);
    if (!subticket) {
      return res.status(404).json({ message: 'Sous-ticket non trouvé' });
    }
    
    // Update fields if provided
       if (title !== undefined) subticket.title = title;
    if (description !== undefined) subticket.description = description;
    if (priority !== undefined) subticket.priority = priority;
    if (status !== undefined) subticket.status = status;
    if (clientConcerned !== undefined) subticket.clientConcerned = clientConcerned;
    if (assignedUsers !== undefined) subticket.assignedUsers = assignedUsers;
    if (dueDate !== undefined) subticket.dueDate = dueDate;
    if (reminderDate !== undefined) subticket.reminderDate = reminderDate;
    if (reminderType !== undefined) subticket.reminderType = reminderType;
    if (ticketType !== undefined) subticket.ticketType = ticketType;
    
    const updatedSubticket = await subticket.save();

   res.status(200).json({
      message: 'Sous-ticket mis à jour avec succès',
      subticket: updatedSubticket
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du sous-ticket', 
      error: error.message 
    });
  }
};

// Delete a subticket
exports.deleteSubTicket = async (req, res) => {
  try {
    const result = await SubTicket.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Sous-ticket non trouvé' });
    }
    
    res.status(200).json({ message: 'Sous-ticket supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la suppression du sous-ticket', 
      error: error.message 
    });
  }
};

// Delete all subtickets for a specific ticket
exports.deleteSubTicketsByTicketId = async (req, res) => {
  try {
    const result = await SubTicket.deleteMany({ ticketId: req.params.ticketId });
    
    res.status(200).json({ 
      message: `${result.deletedCount} sous-ticket(s) supprimé(s) avec succès` 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la suppression des sous-tickets', 
      error: error.message 
    });
  }
};