// backend/Controllers/exportController.js
const Client = require('../Models/Client');
const Ticket = require('../Models/Ticket');
const User = require('../Models/User');
const Prospect = require('../Models/Prospect');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Fonction utilitaire pour formater la date
const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString('fr-FR') : '';
};

// Fonction pour créer le répertoire d'export s'il n'existe pas
const createExportDir = () => {
  const dir = path.join(__dirname, '../exports');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Helper function to generate CSV response
const generateCSVResponse = async (data, headers, filename, res) => {
  try {
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Aucune donnée trouvée avec ces critères' });
    }

    const csvString = [
      headers.map(h => h.title).join(','),
      ...data.map(row => 
        headers.map(h => {
          const value = row[h.id] || '';
          // Échapper les guillemets et entourer de guillemets si nécessaire
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\ufeff' + csvString); // BOM pour Excel
  } catch (error) {
    console.error('Erreur génération CSV:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du CSV' });
  }
};

// Helper function to generate XLSX response
const generateXLSXResponse = (data, sheetName, filename, res) => {
  try {
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Aucune donnée trouvée avec ces critères' });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Erreur génération XLSX:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du XLSX' });
  }
};

// Export Users CSV (Version améliorée)
exports.exportUsersCSV = async (req, res) => {
  try {
    console.log('Début exportUsersCSV'); // Log de débogage
    
    const { role } = req.query;
    let query = {};
    
    if (role) {
      query.role = role;
      console.log(`Filtre role: ${role}`); // Log de débogage
    }

    const users = await User.find(query).lean();
    console.log(`Nombre d'utilisateurs trouvés: ${users.length}`); // Log de débogage
    
    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé'); // Log de débogage
      return res.status(404).json({ message: 'Aucun utilisateur trouvé avec ces critères' });
    }

    const headers = [
      { id: 'id', title: 'ID' },
      { id: 'nom', title: 'Nom' },
      { id: 'prenom', title: 'Prénom' },
      { id: 'email', title: 'Email' },
      { id: 'role', title: 'Rôle' },
      { id: 'dateCreation', title: 'Date de Création' },
      { id: 'actif', title: 'Actif' }
    ];

    const records = users.map(user => ({
      id: user._id.toString(),
      nom: user.nom || 'Non spécifié',
      prenom: user.prenom || 'Non spécifié',
      email: user.email || 'Non spécifié',
      role: user.role || 'Non spécifié',
      dateCreation: formatDate(user.createdAt),
      actif: user.isActive !== false ? 'Oui' : 'Non'
    }));

    console.log('Génération du CSV...'); // Log de débogage
    await generateCSVResponse(records, headers, `users_export_${Date.now()}.csv`, res);
    console.log('Export CSV terminé avec succès'); // Log de débogage
  } catch (error) {
    console.error('Erreur lors de l\'exportation des utilisateurs:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'exportation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Export Users XLSX (Version améliorée)
exports.exportUsersXLSX = async (req, res) => {
  try {
    console.log('Début exportUsersXLSX'); // Log de débogage
    
    const { role } = req.query;
    let query = {};
    
    if (role) {
      query.role = role;
      console.log(`Filtre role: ${role}`); // Log de débogage
    }

    const users = await User.find(query).lean();
    console.log(`Nombre d'utilisateurs trouvés: ${users.length}`); // Log de débogage
    
    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé'); // Log de débogage
      return res.status(404).json({ message: 'Aucun utilisateur trouvé avec ces critères' });
    }

    const userData = users.map(user => ({
      ID: user._id.toString(),
      'Nom': user.nom || 'Non spécifié',
      'Prénom': user.prenom || 'Non spécifié',
      'Email': user.email || 'Non spécifié',
      'Rôle': user.role || 'Non spécifié',
      'Date de Création': formatDate(user.createdAt),
      'Actif': user.isActive !== false ? 'Oui' : 'Non'
    }));

    console.log('Génération du XLSX...'); // Log de débogage
    generateXLSXResponse(userData, 'Utilisateurs', `users_export_${Date.now()}.xlsx`, res);
    console.log('Export XLSX terminé avec succès'); // Log de débogage
  } catch (error) {
    console.error('Erreur lors de l\'exportation des utilisateurs en XLSX:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'exportation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Export Users JSON (Version améliorée)
exports.exportUsersJSON = async (req, res) => {
  try {
    console.log('Début exportUsersJSON'); // Log de débogage
    
    const { role } = req.query;
    let query = {};
    
    if (role) {
      query.role = role;
      console.log(`Filtre role: ${role}`); // Log de débogage
    }

    const users = await User.find(query).lean();
    console.log(`Nombre d'utilisateurs trouvés: ${users.length}`); // Log de débogage
    
    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé'); // Log de débogage
      return res.status(404).json({ message: 'Aucun utilisateur trouvé avec ces critères' });
    }

    const userData = users.map(user => ({
      id: user._id.toString(),
      nom: user.nom || 'Non spécifié',
      prenom: user.prenom || 'Non spécifié',
      email: user.email || 'Non spécifié',
      role: user.role || 'Non spécifié',
      dateCreation: formatDate(user.createdAt),
      actif: user.isActive !== false
    }));

    console.log('Envoi de la réponse JSON...'); // Log de débogage
    res.json({
      success: true,
      count: users.length,
      data: userData
    });
    console.log('Export JSON terminé avec succès'); // Log de débogage
  } catch (error) {
    console.error('Erreur lors de l\'exportation des utilisateurs en JSON:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de l\'exportation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




// Export Dashboard CSV
exports.exportDashboardCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    }
    const clientCount = await Client.countDocuments(dateFilter);
    const ticketCount = await Ticket.countDocuments(dateFilter);
    const openTicketCount = await Ticket.countDocuments({ ...dateFilter, status: 'ouvert' });
    const closedTicketCount = await Ticket.countDocuments({ ...dateFilter, status: 'fermé' });
    const periode = startDate && endDate
      ? `${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`
      : 'Toutes les données';
    const headers = [
      { id: 'metrique', title: 'Métrique' },
      { id: 'valeur', title: 'Valeur' },
      { id: 'periode', title: 'Période' }
    ];
    const records = [
      { metrique: 'Nombre total de clients', valeur: clientCount, periode },
      { metrique: 'Nombre total de tickets', valeur: ticketCount, periode },
      { metrique: 'Tickets ouverts', valeur: openTicketCount, periode },
      { metrique: 'Tickets fermés', valeur: closedTicketCount, periode }
    ];
    await generateCSVResponse(records, headers, `dashboard_export_${Date.now()}.csv`, res);
  } catch (error) {
    console.error('Erreur lors de l\'exportation des données du dashboard:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};
// Export Dashboard XLSX
exports.exportDashboardXLSX = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    }
    const clientCount = await Client.countDocuments(dateFilter);
    const ticketCount = await Ticket.countDocuments(dateFilter);
    const openTicketCount = await Ticket.countDocuments({ ...dateFilter, status: 'ouvert' });
    const closedTicketCount = await Ticket.countDocuments({ ...dateFilter, status: 'fermé' });
    const periode = startDate && endDate
      ? `${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`
      : 'Toutes les données';
    const dashboardData = [
      { 'Métrique': 'Nombre total de clients', 'Valeur': clientCount, 'Période': periode },
      { 'Métrique': 'Nombre total de tickets', 'Valeur': ticketCount, 'Période': periode },
      { 'Métrique': 'Tickets ouverts', 'Valeur': openTicketCount, 'Période': periode },
      { 'Métrique': 'Tickets fermés', 'Valeur': closedTicketCount, 'Période': periode }
    ];
    generateXLSXResponse(dashboardData, 'Dashboard', `dashboard_export_${Date.now()}.xlsx`, res);
  } catch (error) {
    console.error('Erreur lors de l\'exportation des données du dashboard en XLSX:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};
// Export Dashboard JSON
exports.exportDashboardJSON = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    }
    const clientCount = await Client.countDocuments(dateFilter);
    const ticketCount = await Ticket.countDocuments(dateFilter);
    const openTicketCount = await Ticket.countDocuments({ ...dateFilter, status: 'ouvert' });
    const closedTicketCount = await Ticket.countDocuments({ ...dateFilter, status: 'fermé' });
    const periode = startDate && endDate
      ? `${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`
      : 'Toutes les données';
    const dashboardData = [
      { metrique: 'Nombre total de clients', valeur: clientCount, periode },
      { metrique: 'Nombre total de tickets', valeur: ticketCount, periode },
      { metrique: 'Tickets ouverts', valeur: openTicketCount, periode },
      { metrique: 'Tickets fermés', valeur: closedTicketCount, periode }
    ];
    res.json(dashboardData);
  } catch (error) {
    console.error('Erreur lors de l\'exportation des données du dashboard en JSON:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};




// Export Prospects CSV
exports.exportProspectsCSV = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) {
      query.status = status;
    }
    const prospects = await Prospect.find(query);
    
    const headers = [
      { id: 'id', title: 'ID' },
      { id: 'nom', title: 'Nom' },
      { id: 'email', title: 'Email' },
      { id: 'telephone', title: 'Téléphone' },
      { id: 'societe', title: 'Société' },
      { id: 'status', title: 'Statut' },
      { id: 'dateCreation', title: 'Date de Création' }
    ];
    const records = prospects.map(p => ({
      id: p._id.toString(),
      nom: p.nom || '',
      email: p.email || '',
      telephone: p.telephone || '',
      societe: p.societe || '',
      status: p.status || '',
      dateCreation: formatDate(p.createdAt)
    }));
    await generateCSVResponse(records, headers, `prospects_export_${Date.now()}.csv`, res);
  } catch (error) {
    console.error('Erreur lors de l\'exportation des prospects en CSV:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};
// Export Prospects XLSX
exports.exportProspectsXLSX = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) {
      query.status = status;
    }
    const prospects = await Prospect.find(query);
    
    const data = prospects.map(p => ({
      ID: p._id.toString(),
      Nom: p.nom || '',
      Email: p.email || '',
      Téléphone: p.telephone || '',
      Société: p.societe || '',
      Statut: p.status || '',
      'Date de Création': formatDate(p.createdAt)
    }));
    generateXLSXResponse(data, 'Prospects', `prospects_export_${Date.now()}.xlsx`, res);
  } catch (error) {
    console.error('Erreur lors de l\'exportation des prospects en XLSX:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};
// Export Prospects JSON
exports.exportProspectsJSON = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) {
      query.status = status;
    }
    const prospects = await Prospect.find(query);
    if (prospects.length === 0) {
      return res.status(404).json({ message: 'Aucun prospect trouvé avec ces critères' });
    }
    const data = prospects.map(p => ({
      id: p._id.toString(),
      nom: p.nom || '',
      email: p.email || '',
      telephone: p.telephone || '',
      societe: p.societe || '',
      status: p.status || '',
      dateCreation: formatDate(p.createdAt)
    }));
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de l\'exportation des prospects en JSON:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};
// Export Clients CSV
exports.exportClientsCSV = async (req, res) => {
  try {
    console.log('Début exportClientsCSV');
    
    const { status, startDate, endDate } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
      console.log(`Filtre status: ${status}`);
    }
    
    if (startDate && endDate) {
      query.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
      console.log(`Filtre dates: ${startDate} à ${endDate}`);
    }

    const clients = await Client.find(query).lean();
    console.log(`Nombre de clients trouvés: ${clients.length}`);
    
    if (clients.length === 0) {
      console.log('Aucun client trouvé');
      return res.status(404).json({ message: 'Aucun client trouvé avec ces critères' });
    }

    const headers = [
      { id: 'id', title: 'ID' },
      { id: 'nom', title: 'Nom' },
      { id: 'email', title: 'Email' },
      { id: 'telephone', title: 'Téléphone' },
      { id: 'societe', title: 'Société' },
      { id: 'status', title: 'Statut' },
      { id: 'dateCreation', title: 'Date de Création' }
    ];

    const records = clients.map(client => ({
      id: client._id.toString(),
      nom: client.nom || 'Non spécifié',
      email: client.email || 'Non spécifié',
      telephone: client.telephone || 'Non spécifié',
      societe: client.societe || 'Non spécifié',
      status: client.status || 'Non spécifié',
      dateCreation: formatDate(client.createdAt)
    }));

    console.log('Génération du CSV...');
    await generateCSVResponse(records, headers, `clients_export_${Date.now()}.csv`, res);
    console.log('Export CSV terminé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'exportation des clients:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'exportation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export Clients XLSX
exports.exportClientsXLSX = async (req, res) => {
  try {
    console.log('Début exportClientsXLSX');
    
    const { status, startDate, endDate } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
      console.log(`Filtre status: ${status}`);
    }
    
    if (startDate && endDate) {
      query.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
      console.log(`Filtre dates: ${startDate} à ${endDate}`);
    }

    const clients = await Client.find(query).lean();
    console.log(`Nombre de clients trouvés: ${clients.length}`);
    
    if (clients.length === 0) {
      console.log('Aucun client trouvé');
      return res.status(404).json({ message: 'Aucun client trouvé avec ces critères' });
    }

    const clientData = clients.map(client => ({
      ID: client._id.toString(),
      'Nom': client.nom || 'Non spécifié',
      'Email': client.email || 'Non spécifié',
      'Téléphone': client.telephone || 'Non spécifié',
      'Société': client.societe || 'Non spécifié',
      'Statut': client.status || 'Non spécifié',
      'Date de Création': formatDate(client.createdAt)
    }));

    console.log('Génération du XLSX...');
    generateXLSXResponse(clientData, 'Clients', `clients_export_${Date.now()}.xlsx`, res);
    console.log('Export XLSX terminé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'exportation des clients en XLSX:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'exportation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export Clients JSON
exports.exportClientsJSON = async (req, res) => {
  try {
    console.log('Début exportClientsJSON');
    
    const { status, startDate, endDate } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
      console.log(`Filtre status: ${status}`);
    }
    
    if (startDate && endDate) {
      query.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
      console.log(`Filtre dates: ${startDate} à ${endDate}`);
    }

    const clients = await Client.find(query).lean();
    console.log(`Nombre de clients trouvés: ${clients.length}`);
    
    if (clients.length === 0) {
      console.log('Aucun client trouvé');
      return res.status(404).json({ message: 'Aucun client trouvé avec ces critères' });
    }

    const clientData = clients.map(client => ({
      id: client._id.toString(),
      nom: client.nom || 'Non spécifié',
      email: client.email || 'Non spécifié',
      telephone: client.telephone || 'Non spécifié',
      societe: client.societe || 'Non spécifié',
      status: client.status || 'Non spécifié',
      dateCreation: formatDate(client.createdAt)
    }));

    console.log('Envoi de la réponse JSON...');
    res.json({
      success: true,
      count: clients.length,
      data: clientData
    });
    console.log('Export JSON terminé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'exportation des clients en JSON:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de l\'exportation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export Tickets CSV
exports.exportTicketsCSV = async (req, res) => {
  try {
    console.log('Début exportTicketsCSV');
    
    const { status, priority, startDate, endDate } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
      console.log(`Filtre status: ${status}`);
    }
    
    if (priority) {
      query.priority = priority;
      console.log(`Filtre priority: ${priority}`);
    }
    
    if (startDate && endDate) {
      query.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
      console.log(`Filtre dates: ${startDate} à ${endDate}`);
    }

    const tickets = await Ticket.find(query).populate('client', 'nom email').lean();
    console.log(`Nombre de tickets trouvés: ${tickets.length}`);
    
    if (tickets.length === 0) {
      console.log('Aucun ticket trouvé');
      return res.status(404).json({ message: 'Aucun ticket trouvé avec ces critères' });
    }

    const headers = [
      { id: 'id', title: 'ID' },
      { id: 'titre', title: 'Titre' },
      { id: 'description', title: 'Description' },
      { id: 'status', title: 'Statut' },
      { id: 'priority', title: 'Priorité' },
      { id: 'client', title: 'Client' },
      { id: 'dateCreation', title: 'Date de Création' }
    ];

    const records = tickets.map(ticket => ({
      id: ticket._id.toString(),
      titre: ticket.titre || 'Non spécifié',
      description: ticket.description || 'Non spécifié',
      status: ticket.status || 'Non spécifié',
      priority: ticket.priority || 'Non spécifié',
      client: ticket.client ? ticket.client.nom : 'Non assigné',
      dateCreation: formatDate(ticket.createdAt)
    }));

    console.log('Génération du CSV...');
    await generateCSVResponse(records, headers, `tickets_export_${Date.now()}.csv`, res);
    console.log('Export CSV terminé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'exportation des tickets:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'exportation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export Tickets XLSX
exports.exportTicketsXLSX = async (req, res) => {
  try {
    console.log('Début exportTicketsXLSX');
    
    const { status, priority, startDate, endDate } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
      console.log(`Filtre status: ${status}`);
    }
    
    if (priority) {
      query.priority = priority;
      console.log(`Filtre priority: ${priority}`);
    }
    
    if (startDate && endDate) {
      query.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
      console.log(`Filtre dates: ${startDate} à ${endDate}`);
    }

    const tickets = await Ticket.find(query).populate('client', 'nom email').lean();
    console.log(`Nombre de tickets trouvés: ${tickets.length}`);
    
    if (tickets.length === 0) {
      console.log('Aucun ticket trouvé');
      return res.status(404).json({ message: 'Aucun ticket trouvé avec ces critères' });
    }

    const ticketData = tickets.map(ticket => ({
      ID: ticket._id.toString(),
      'Titre': ticket.titre || 'Non spécifié',
      'Description': ticket.description || 'Non spécifié',
      'Statut': ticket.status || 'Non spécifié',
      'Priorité': ticket.priority || 'Non spécifié',
      'Client': ticket.client ? ticket.client.nom : 'Non assigné',
      'Date de Création': formatDate(ticket.createdAt)
    }));

    console.log('Génération du XLSX...');
    generateXLSXResponse(ticketData, 'Tickets', `tickets_export_${Date.now()}.xlsx`, res);
    console.log('Export XLSX terminé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'exportation des tickets en XLSX:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'exportation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export Tickets JSON
exports.exportTicketsJSON = async (req, res) => {
  try {
    console.log('Début exportTicketsJSON');
    
    const { status, priority, startDate, endDate } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
      console.log(`Filtre status: ${status}`);
    }
    
    if (priority) {
      query.priority = priority;
      console.log(`Filtre priority: ${priority}`);
    }
    
    if (startDate && endDate) {
      query.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
      console.log(`Filtre dates: ${startDate} à ${endDate}`);
    }

    const tickets = await Ticket.find(query).populate('client', 'nom email').lean();
    console.log(`Nombre de tickets trouvés: ${tickets.length}`);
    
    if (tickets.length === 0) {
      console.log('Aucun ticket trouvé');
      return res.status(404).json({ message: 'Aucun ticket trouvé avec ces critères' });
    }

    const ticketData = tickets.map(ticket => ({
      id: ticket._id.toString(),
      titre: ticket.titre || 'Non spécifié',
      description: ticket.description || 'Non spécifié',
      status: ticket.status || 'Non spécifié',
      priority: ticket.priority || 'Non spécifié',
      client: ticket.client ? {
        id: ticket.client._id,
        nom: ticket.client.nom,
        email: ticket.client.email
      } : null,
      dateCreation: formatDate(ticket.createdAt)
    }));

    console.log('Envoi de la réponse JSON...');
    res.json({
      success: true,
      count: tickets.length,
      data: ticketData
    });
    console.log('Export JSON terminé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'exportation des tickets en JSON:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de l\'exportation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};