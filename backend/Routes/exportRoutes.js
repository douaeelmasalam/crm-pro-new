// Routes/exportRoutes.js - Version complète avec toutes les routes d'export

const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const Client = require('../Models/Client');
const Prospect = require('../Models/Prospect');
const Ticket = require('../Models/Ticket');

// Middleware pour logging des exports
const logExport = (req, res, next) => {
  console.log(`[EXPORT] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  console.log('[EXPORT] Query params:', req.query);
  next();
};

// Fonction utilitaire pour générer du CSV
const generateCSV = (data, headers) => {
  if (!data || data.length === 0) {
    return headers.join(',') + '\n';
  }
  
  const csvHeader = headers.join(',') + '\n';
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header.toLowerCase()] || row[header] || '';
      // Échapper les guillemets et encapsuler les valeurs avec des virgules
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return csvHeader + csvRows.join('\n');
};

// Fonction pour générer un nom de fichier avec timestamp
const generateFileName = (prefix, extension) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}_export_${timestamp}.${extension}`;
};

// ===== ROUTES POUR USERS =====

router.get('/users/csv', logExport, async (req, res) => {
  try {
    const { role, status } = req.query;
    
    let query = {};
    if (role && role.trim() !== '') query.role = role;
    if (status && status.trim() !== '') query.status = status;

    const users = await User.find(query).select('_id name email role status createdAt');
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aucun utilisateur trouvé' 
      });
    }

    const csvData = users.map(user => ({
      ID: user._id,
      Nom: user.name || '',
      Email: user.email || '',
      Rôle: user.role || '',
      Statut: user.status || 'Actif',
      'Date de création': user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : ''
    }));

    const csv = generateCSV(csvData, ['ID', 'Nom', 'Email', 'Rôle', 'Statut', 'Date de création']);

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=${generateFileName('users', 'csv')}`
    });

    res.send(csv);

  } catch (error) {
    console.error('[ERREUR] Export users CSV:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'export CSV des utilisateurs',
      error: error.message 
    });
  }
});

router.get('/users/xlsx', logExport, async (req, res) => {
  try {
    const { role, status } = req.query;
    
    let query = {};
    if (role && role.trim() !== '') query.role = role;
    if (status && status.trim() !== '') query.status = status;

    const users = await User.find(query).select('_id name email role status createdAt');
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aucun utilisateur trouvé' 
      });
    }

    const csvData = users.map(user => ({
      ID: user._id,
      Nom: user.name || '',
      Email: user.email || '',
      Rôle: user.role || '',
      Statut: user.status || 'Actif',
      'Date de création': user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : ''
    }));

    const csv = generateCSV(csvData, ['ID', 'Nom', 'Email', 'Rôle', 'Statut', 'Date de création']);

    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': `attachment; filename=${generateFileName('users', 'xlsx')}`
    });

    res.send(csv);

  } catch (error) {
    console.error('[ERREUR] Export users Excel:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'export Excel des utilisateurs',
      error: error.message 
    });
  }
});

router.get('/users/json', logExport, async (req, res) => {
  try {
    const { role, status } = req.query;
    
    let query = {};
    if (role && role.trim() !== '') query.role = role;
    if (status && status.trim() !== '') query.status = status;

    const users = await User.find(query);
    
    res.json({
      success: true,
      count: users.length,
      data: users,
      exportDate: new Date().toISOString(),
      filters: { role, status }
    });

  } catch (error) {
    console.error('[ERREUR] Export users JSON:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'export JSON des utilisateurs',
      error: error.message 
    });
  }
});

// ===== ROUTES POUR CLIENTS =====

router.get('/clients/csv', logExport, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    if (status && status.trim() !== '') query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const clients = await Client.find(query);
    
    if (clients.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aucun client trouvé' 
      });
    }

    const csvData = clients.map(client => ({
      ID: client._id,
      Nom: client.name || '',
      Email: client.email || '',
      Téléphone: client.phone || '',
      Entreprise: client.company || '',
      Statut: client.status || '',
      'Date de création': client.createdAt ? new Date(client.createdAt).toLocaleDateString('fr-FR') : ''
    }));

    const csv = generateCSV(csvData, ['ID', 'Nom', 'Email', 'Téléphone', 'Entreprise', 'Statut', 'Date de création']);

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=${generateFileName('clients', 'csv')}`
    });

    res.send(csv);

  } catch (error) {
    console.error('[ERREUR] Export clients CSV:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'export CSV des clients',
      error: error.message 
    });
  }
});

router.get('/clients/xlsx', logExport, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    if (status && status.trim() !== '') query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const clients = await Client.find(query);
    
    if (clients.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aucun client trouvé' 
      });
    }

    const csvData = clients.map(client => ({
      ID: client._id,
      Nom: client.name || '',
      Email: client.email || '',
      Téléphone: client.phone || '',
      Entreprise: client.company || '',
      Statut: client.status || '',
      'Date de création': client.createdAt ? new Date(client.createdAt).toLocaleDateString('fr-FR') : ''
    }));

    const csv = generateCSV(csvData, ['ID', 'Nom', 'Email', 'Téléphone', 'Entreprise', 'Statut', 'Date de création']);

    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': `attachment; filename=${generateFileName('clients', 'xlsx')}`
    });

    res.send(csv);

  } catch (error) {
    console.error('[ERREUR] Export clients Excel:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'export Excel des clients',
      error: error.message 
    });
  }
});

router.get('/clients/json', logExport, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    if (status && status.trim() !== '') query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const clients = await Client.find(query);
    
    res.json({
      success: true,
      count: clients.length,
      data: clients,
      exportDate: new Date().toISOString(),
      filters: { status, startDate, endDate }
    });

  } catch (error) {
    console.error('[ERREUR] Export clients JSON:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'export JSON des clients',
      error: error.message 
    });
  }
});

// ===== ROUTES POUR PROSPECTS =====

router.get('/prospects/csv', logExport, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    if (status && status.trim() !== '') query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const prospects = await Prospect.find(query);
    
    if (prospects.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aucun prospect trouvé' 
      });
    }

    const csvData = prospects.map(prospect => ({
      ID: prospect._id,
      Nom: prospect.name || '',
      Email: prospect.email || '',
      Téléphone: prospect.phone || '',
      Entreprise: prospect.company || '',
      Source: prospect.source || '',
      Statut: prospect.status || '',
      'Date de création': prospect.createdAt ? new Date(prospect.createdAt).toLocaleDateString('fr-FR') : ''
    }));

    const csv = generateCSV(csvData, ['ID', 'Nom', 'Email', 'Téléphone', 'Entreprise', 'Source', 'Statut', 'Date de création']);

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=${generateFileName('prospects', 'csv')}`
    });

    res.send(csv);

  } catch (error) {
    console.error('[ERREUR] Export prospects CSV:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'export CSV des prospects',
      error: error.message 
    });
  }
});

router.get('/prospects/xlsx', logExport, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    if (status && status.trim() !== '') query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const prospects = await Prospect.find(query);
    
    if (prospects.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aucun prospect trouvé' 
      });
    }

    const csvData = prospects.map(prospect => ({
      ID: prospect._id,
      Nom: prospect.name || '',
      Email: prospect.email || '',
      Téléphone: prospect.phone || '',
      Entreprise: prospect.company || '',
      Source: prospect.source || '',
      Statut: prospect.status || '',
      'Date de création': prospect.createdAt ? new Date(prospect.createdAt).toLocaleDateString('fr-FR') : ''
    }));

    const csv = generateCSV(csvData, ['ID', 'Nom', 'Email', 'Téléphone', 'Entreprise', 'Source', 'Statut', 'Date de création']);

    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': `attachment; filename=${generateFileName('prospects', 'xlsx')}`
    });

    res.send(csv);

  } catch (error) {
    console.error('[ERREUR] Export prospects Excel:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'export Excel des prospects',
      error: error.message 
    });
  }
});

router.get('/prospects/json', logExport, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    if (status && status.trim() !== '') query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const prospects = await Prospect.find(query);
    
    res.json({
      success: true,
      count: prospects.length,
      data: prospects,
      exportDate: new Date().toISOString(),
      filters: { status, startDate, endDate }
    });

  } catch (error) {
    console.error('[ERREUR] Export prospects JSON:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'export JSON des prospects',
      error: error.message 
    });
  }
});

// ===== ROUTES POUR TICKETS =====

router.get('/tickets/csv', logExport, async (req, res) => {
  try {
    const { status, priority, startDate, endDate } = req.query;
    
    let query = {};
    if (status && status.trim() !== '') query.status = status;
    if (priority && priority.trim() !== '') query.priority = priority;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const tickets = await Ticket.find(query).populate('assignedUsers', 'name email');
    
    if (tickets.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aucun ticket trouvé' 
      });
    }

    const csvData = tickets.map(ticket => ({
      ID: ticket._id,
      Titre: ticket.title || '',
      Description: ticket.description || '',
      Type: ticket.ticketType || '',
      Statut: ticket.status || '',
      Priorité: ticket.priority || '',
      Client: ticket.clientConcerned || '',
      'Utilisateurs assignés': ticket.assignedUsers ? 
        ticket.assignedUsers.map(user => user.name || user.email).join('; ') : '',
      'Date d\'échéance': ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString('fr-FR') : '',
      'Date de création': ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('fr-FR') : '',
      'Date de mise à jour': ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString('fr-FR') : ''
    }));

    const csv = generateCSV(csvData, [
      'ID', 'Titre', 'Description', 'Type', 'Statut', 'Priorité', 'Client', 
      'Utilisateurs assignés', 'Date d\'échéance', 'Date de création', 'Date de mise à jour'
    ]);

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=${generateFileName('tickets', 'csv')}`
    });

    res.send(csv);

  } catch (error) {
    console.error('[ERREUR] Export tickets CSV:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'export CSV des tickets',
      error: error.message 
    });
  }
});

router.get('/tickets/xlsx', logExport, async (req, res) => {
  try {
    const { status, priority, startDate, endDate } = req.query;
    
    let query = {};
    if (status && status.trim() !== '') query.status = status;
    if (priority && priority.trim() !== '') query.priority = priority;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const tickets = await Ticket.find(query).populate('assignedUsers', 'name email');
    
    if (tickets.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aucun ticket trouvé' 
      });
    }

    const csvData = tickets.map(ticket => ({
      ID: ticket._id,
      Titre: ticket.title || '',
      Description: ticket.description || '',
      Type: ticket.ticketType || '',
      Statut: ticket.status || '',
      Priorité: ticket.priority || '',
      Client: ticket.clientConcerned || '',
      'Utilisateurs assignés': ticket.assignedUsers ? 
        ticket.assignedUsers.map(user => user.name || user.email).join('; ') : '',
      'Date d\'échéance': ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString('fr-FR') : '',
      'Date de création': ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('fr-FR') : '',
      'Date de mise à jour': ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString('fr-FR') : ''
    }));

    const csv = generateCSV(csvData, [
      'ID', 'Titre', 'Description', 'Type', 'Statut', 'Priorité', 'Client', 
      'Utilisateurs assignés', 'Date d\'échéance', 'Date de création', 'Date de mise à jour'
    ]);

    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': `attachment; filename=${generateFileName('tickets', 'xlsx')}`
    });

    res.send(csv);

  } catch (error) {
    console.error('[ERREUR] Export tickets Excel:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'export Excel des tickets',
      error: error.message 
    });
  }
});

router.get('/tickets/json', logExport, async (req, res) => {
  try {
    const { status, priority, startDate, endDate } = req.query;
    
    let query = {};
    if (status && status.trim() !== '') query.status = status;
    if (priority && priority.trim() !== '') query.priority = priority;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const tickets = await Ticket.find(query).populate('assignedUsers', 'name email');
    
    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
      exportDate: new Date().toISOString(),
      filters: { status, priority, startDate, endDate }
    });

  } catch (error) {
    console.error('[ERREUR] Export tickets JSON:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'export JSON des tickets',
      error: error.message 
    });
  }
});

// Route de test pour vérifier que les routes fonctionnent
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Routes d\'export fonctionnelles',
    availableRoutes: [
      // Users
      'GET /api/export/users/csv',
      'GET /api/export/users/xlsx', 
      'GET /api/export/users/json',
      // Clients
      'GET /api/export/clients/csv',
      'GET /api/export/clients/xlsx',
      'GET /api/export/clients/json',
      // Prospects
      'GET /api/export/prospects/csv',
      'GET /api/export/prospects/xlsx',
      'GET /api/export/prospects/json',
      // Tickets
      'GET /api/export/tickets/csv',
      'GET /api/export/tickets/xlsx',
      'GET /api/export/tickets/json'
    ],
    supportedFilters: {
      users: ['role', 'status'],
      clients: ['status', 'startDate', 'endDate'],
      prospects: ['status', 'startDate', 'endDate'],
      tickets: ['status', 'priority', 'startDate', 'endDate']
    }
  });
});

module.exports = router;