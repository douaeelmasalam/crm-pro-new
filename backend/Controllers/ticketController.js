// Controllers/ticketController.js
const Ticket = require('../Models/Ticket');
const User = require('../Models/User');

// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    console.log('=== Requête reçue pour création de ticket ===');
    console.log('Corps de la requête :', req.body);

    const {
      title,
      description,
      priority,
      clientConcerned,
      assignedUsers,
      status,
      dueDate,
      reminderDate,
      reminderType,
      ticketSource,
      ticketType
    } = req.body;

    // Vérification des champs requis
    if (!title || !description) {
      console.log('Champs manquants ou invalides');
      return res.status(400).json({ message: 'Champs requis manquants ou invalides (titre et description)' });
    }

    console.log('Création du ticket avec les données suivantes :');
    console.log({
      title,
      description,
      priority,
      clientConcerned,
      assignedUsers,
      status,
      dueDate,
      reminderDate,
      reminderType,
      ticketSource,
      ticketType
    });

    const newTicket = new Ticket({
      title,
      description,
      priority: priority || 'faible',
      clientConcerned,
      assignedUsers: Array.isArray(assignedUsers) ? assignedUsers : [],
      status: status || 'ouvert',
      dueDate,
      reminderDate,
      reminderType: reminderType || 'email',
      ticketSource: ticketSource || 'email',
      ticketType
    });

    console.log('Objet Ticket prêt à être sauvegardé :', newTicket);

    const savedTicket = await newTicket.save();

    console.log('Ticket sauvegardé avec succès :', savedTicket);

    res.status(201).json({ message: 'Ticket créé avec succès', ticket: savedTicket });

  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    res.status(500).json({ message: 'Erreur lors de la création du ticket.' });
  }
};

// Create subtickets in batch for a specific ticket
exports.createSubtickets = async (req, res) => {
  try {
    const { subtickets, ticketId } = req.body;
    
    console.log('=== Requête reçue pour création de sous-tickets ===');
    console.log('TicketID:', ticketId);
    console.log('Sous-tickets:', subtickets);
    
    if (!ticketId || !subtickets || !Array.isArray(subtickets) || subtickets.length === 0) {
      return res.status(400).json({ message: 'ID du ticket et liste des sous-tickets requis' });
    }
    
    // Validate that the ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    // Add subtickets to the ticket
    subtickets.forEach(subticket => {
      ticket.subtickets.push({
        title: subticket.title,
        description: subticket.description,
        priority: subticket.priority || 'faible'
      });
    });
    
    // Save the updated ticket
    const updatedTicket = await ticket.save();
    
    console.log('Sous-tickets ajoutés avec succès');
    res.status(201).json({ 
      message: 'Sous-tickets ajoutés avec succès', 
      ticket: updatedTicket 
    });
    
  } catch (error) {
    console.error('Erreur lors de la création des sous-tickets:', error);
    res.status(500).json({ message: 'Erreur lors de la création des sous-tickets.' });
  }
};

// Get all tickets with formatting for the frontend
exports.getAllTickets = async (req, res) => {
  try {
    console.log('Requête pour obtenir tous les tickets');

    const tickets = await Ticket.find().sort({ createdAt: -1 });
    console.log('Tickets récupérés :', tickets);

    // Fetch the user data based on the assigned user IDs
    const assignedUserIds = tickets.flatMap(ticket => ticket.assignedUsers);
    console.log('IDs des utilisateurs assignés :', assignedUserIds);

    const users = await User.find({ '_id': { $in: assignedUserIds } });
    console.log('👥 Utilisateurs récupérés :', users);

    // Map the users to their ids for quick lookup
    const userLookup = users.reduce((acc, user) => {
      acc[user._id] = user; // Directly use the ObjectId without converting to string
      return acc;
    }, {});
    console.log('Lookup des utilisateurs par ID :', userLookup);

    // Attach the user data to each ticket
    const ticketsWithUsernames = tickets.map(ticket => {
      const updatedAssignedUsers = ticket.assignedUsers.map(userId => {
        const user = userLookup[userId];  // No need to convert userId to string
        
        if (!user) {
          console.warn(`Utilisateur non trouvé pour l'ID : ${userId}`);
          return null; // Return null if user not found
        }

        console.log(`Recherche pour l'ID de l'utilisateur : ${userId}`, user);
        return { name: user.name || user.username };  // Send only the 'name' to be displayed
      }).filter(user => user); // Remove any null values

      return { ...ticket.toObject(), assignedUsers: updatedAssignedUsers };
    });

    console.log('Tickets avec utilisateurs assignés :', ticketsWithUsernames);

    res.status(200).json(ticketsWithUsernames);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets.' });
  }
};

// Get ticket by ID with populated assigned users
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('assignedUsers', 'name username');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error('Erreur lors de la récupération du ticket:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du ticket' });
  }
};

// Update a ticket
exports.updateTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const updatedData = req.body;

    const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, updatedData, {
      new: true,
      runValidators: true
    });

    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket non trouvé.' });
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du ticket :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du ticket.' });
  }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
  try {
    const deletedTicket = await Ticket.findByIdAndDelete(req.params.id);
    
    if (!deletedTicket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    res.status(200).json({ message: 'Ticket supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du ticket:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du ticket' });
  }
};
exports.getTicketsAssignedToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Vérifiez que l'utilisateur demande ses propres tickets assignés
    // ou qu'il a les permissions d'administrateur
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à voir ces tickets' });
    }
    
    // Recherchez les tickets assignés à cet utilisateur
    const tickets = await Ticket.find({ assignedTo: userId })
      .populate('client', 'name email')
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 }); // Du plus récent au plus ancien
      
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets assignés:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des tickets' });
  }
};

// Get tickets by status
exports.getTicketsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status
    const validStatuses = ['ouvert', 'en cours', 'résolu', 'fermé'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Paramètre de statut invalide' });
    }
    
    const tickets = await Ticket.find({ status }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets par statut:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets' });
  }
};

// Get tickets by priority
exports.getTicketsByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    
    // Validate priority
    const validPriorities = ['faible', 'moyenne', 'élevée', 'critique'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Paramètre de priorité invalide' });
    }
    
    const tickets = await Ticket.find({ priority }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets par priorité:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets' });
  }
};

// Get tickets assigned to a specific user
exports.getTicketsByAssignee = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find the user first to get their ID
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const tickets = await Ticket.find({ assignedUsers: user._id }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets par assigné:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets' });
  }
};

// Get tickets for a specific client
exports.getTicketsByClient = async (req, res) => {
  try {
    const { client } = req.params;
    
    const tickets = await Ticket.find({ clientConcerned: client }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets par client:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets' });
  }
};

// Search tickets
exports.searchTickets = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Requête de recherche requise' });
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
    console.error('Erreur lors de la recherche de tickets:', error);
    res.status(500).json({ message: 'Erreur lors de la recherche de tickets' });
  }
};

// Get tickets by source type
exports.getTicketsBySource = async (req, res) => {
  try {
    const { source } = req.params;
    
    // Validate source
    const validSources = ['email', 'telephone', 'chat', 'formulaire'];
    if (!validSources.includes(source)) {
      return res.status(400).json({ message: 'Paramètre de source invalide' });
    }
    
    const tickets = await Ticket.find({ ticketSource: source }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets par source:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets' });
  }
};

// Get tickets by ticket type
exports.getTicketsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    // Validate ticket type
    const validTypes = ['bug', 'feature', 'support', 'question', 'autre'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Paramètre de type de ticket invalide' });
    }
    
    const tickets = await Ticket.find({ ticketType: type }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets par type:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets' });
  }
};

// Update a subticket
exports.updateSubticket = async (req, res) => {
  try {
    const { ticketId, subticketId } = req.params;
    const { title, description, priority, status } = req.body;
    
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    // Find the subticket in the subtickets array
    const subticket = ticket.subtickets.id(subticketId);
    if (!subticket) {
      return res.status(404).json({ message: 'Sous-ticket non trouvé' });
    }
    
    // Update the subticket fields
    if (title) subticket.title = title;
    if (description) subticket.description = description;
    if (priority) subticket.priority = priority;
    if (status) subticket.status = status;
    
    // Save the ticket with the updated subticket
    await ticket.save();
    
    res.status(200).json({ message: 'Sous-ticket mis à jour avec succès', ticket });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du sous-ticket:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du sous-ticket' });
  }
};

// Delete a subticket
exports.deleteSubticket = async (req, res) => {
  try {
    const { ticketId, subticketId } = req.params;
    
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    // Remove the subticket from the subtickets array
    ticket.subtickets.id(subticketId).remove();
    
    // Save the ticket without the deleted subticket
    await ticket.save();
    
    res.status(200).json({ message: 'Sous-ticket supprimé avec succès', ticket });
  } catch (error) {
    console.error('Erreur lors de la suppression du sous-ticket:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du sous-ticket' });
  }
};