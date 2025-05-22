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
    fs.mkdirSync(dir);
  }
  return dir;
};

// Export Clients CSV
exports.exportClientsCSV = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) {
      query.status = status;
    }

    const clients = await Client.find(query);
    if (clients.length === 0) {
      return res.status(404).json({ message: 'Aucun client trouvé avec ces critères' });
    }

    const exportDir = createExportDir();
    const fileName = `clients_export_${Date.now()}.csv`;
    const csvFilePath = path.join(exportDir, fileName);

    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'formeJuridique', title: 'Forme Juridique' },
        { id: 'nom', title: 'Nom' },
        { id: 'email', title: 'Email' },
        { id: 'telephone', title: 'Téléphone' },
        { id: 'adresse', title: 'Adresse' },
        { id: 'dateCreation', title: 'Date de Création' },
        { id: 'status', title: 'Statut' }
      ]
    });

    const records = clients.map(client => ({
      id: client._id.toString(),
      formeJuridique: client.formeJuridique || '',
      nom: client.nom || '',
      email: client.email || '',
      telephone: client.telephone || '',
      adresse: client.adresse || '',
      dateCreation: formatDate(client.createdAt),
      status: client.status || ''
    }));

    await csvWriter.writeRecords(records);

    res.download(csvFilePath, fileName, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du fichier:', err);
        return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
      }
      fs.unlinkSync(csvFilePath);
    });
  } catch (error) {
    console.error('Erreur lors de l\'exportation des clients:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};

// Export Clients XLSX
exports.exportClientsXLSX = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) {
      query.status = status;
    }

    const clients = await Client.find(query);
    if (clients.length === 0) {
      return res.status(404).json({ message: 'Aucun client trouvé avec ces critères' });
    }

    const exportDir = createExportDir();
    const fileName = `clients_export_${Date.now()}.xlsx`;
    const xlsxFilePath = path.join(exportDir, fileName);

    const workbook = XLSX.utils.book_new();
    const clientData = clients.map(client => ({
      ID: client._id.toString(),
      'Forme Juridique': client.formeJuridique || '',
      'Nom': client.nom || '',
      'Email': client.email || '',
      'Téléphone': client.telephone || '',
      'Adresse': client.adresse || '',
      'Date de Création': formatDate(client.createdAt),
      'Statut': client.status || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(clientData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
    XLSX.writeFile(workbook, xlsxFilePath);

    res.download(xlsxFilePath, fileName, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du fichier:', err);
        return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
      }
      fs.unlinkSync(xlsxFilePath);
    });
  } catch (error) {
    console.error('Erreur lors de l\'exportation des clients en XLSX:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};

// Export Clients JSON (Nouveau)
exports.exportClientsJSON = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) {
      query.status = status;
    }

    const clients = await Client.find(query);
    if (clients.length === 0) {
      return res.status(404).json({ message: 'Aucun client trouvé avec ces critères' });
    }

    const clientData = clients.map(client => ({
      id: client._id.toString(),
      formeJuridique: client.formeJuridique || '',
      nom: client.nom || '',
      email: client.email || '',
      telephone: client.telephone || '',
      adresse: client.adresse || '',
      dateCreation: formatDate(client.createdAt),
      status: client.status || ''
    }));

    res.json(clientData);
  } catch (error) {
    console.error('Erreur lors de l\'exportation des clients en JSON:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};

// Export Tickets CSV
exports.exportTicketsCSV = async (req, res) => {
  try {
    const { startDate, endDate, status, priority } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    const tickets = await Ticket.find(query).populate('client', 'nom');
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Aucun ticket trouvé avec ces critères' });
    }

    const exportDir = createExportDir();
    const fileName = `tickets_export_${Date.now()}.csv`;
    const csvFilePath = path.join(exportDir, fileName);

    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'title', title: 'Titre' },
        { id: 'description', title: 'Description' },
        { id: 'client', title: 'Client' },
        { id: 'status', title: 'Statut' },
        { id: 'priority', title: 'Priorité' },
        { id: 'dateCreation', title: 'Date de Création' },
        { id: 'lastUpdated', title: 'Dernière Mise à Jour' }
      ]
    });

    const records = tickets.map(ticket => ({
      id: ticket._id.toString(),
      title: ticket.title || '',
      description: ticket.description || '',
      client: ticket.client ? ticket.client.nom : '',
      status: ticket.status || '',
      priority: ticket.priority || '',
      dateCreation: formatDate(ticket.createdAt),
      lastUpdated: formatDate(ticket.updatedAt)
    }));

    await csvWriter.writeRecords(records);

    res.download(csvFilePath, fileName, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du fichier:', err);
        return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
      }
      fs.unlinkSync(csvFilePath);
    });
  } catch (error) {
    console.error('Erreur lors de l\'exportation des tickets:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};

// Export Tickets XLSX (Nouveau)
exports.exportTicketsXLSX = async (req, res) => {
  try {
    const { startDate, endDate, status, priority } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    const tickets = await Ticket.find(query).populate('client', 'nom');
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Aucun ticket trouvé avec ces critères' });
    }

    const exportDir = createExportDir();
    const fileName = `tickets_export_${Date.now()}.xlsx`;
    const xlsxFilePath = path.join(exportDir, fileName);

    const workbook = XLSX.utils.book_new();
    const ticketData = tickets.map(ticket => ({
      ID: ticket._id.toString(),
      'Titre': ticket.title || '',
      'Description': ticket.description || '',
      'Client': ticket.client ? ticket.client.nom : '',
      'Statut': ticket.status || '',
      'Priorité': ticket.priority || '',
      'Date de Création': formatDate(ticket.createdAt),
      'Dernière Mise à Jour': formatDate(ticket.updatedAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(ticketData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
    XLSX.writeFile(workbook, xlsxFilePath);

    res.download(xlsxFilePath, fileName, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du fichier:', err);
        return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
      }
      fs.unlinkSync(xlsxFilePath);
    });
  } catch (error) {
    console.error('Erreur lors de l\'exportation des tickets en XLSX:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};

// Export Tickets JSON (Nouveau)
exports.exportTicketsJSON = async (req, res) => {
  try {
    const { startDate, endDate, status, priority } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    const tickets = await Ticket.find(query).populate('client', 'nom');
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Aucun ticket trouvé avec ces critères' });
    }

    const ticketData = tickets.map(ticket => ({
      id: ticket._id.toString(),
      title: ticket.title || '',
      description: ticket.description || '',
      client: ticket.client ? ticket.client.nom : '',
      status: ticket.status || '',
      priority: ticket.priority || '',
      dateCreation: formatDate(ticket.createdAt),
      lastUpdated: formatDate(ticket.updatedAt)
    }));

    res.json(ticketData);
  } catch (error) {
    console.error('Erreur lors de l\'exportation des tickets en JSON:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};

// Export Users CSV
exports.exportUsersCSV = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur trouvé avec ces critères' });
    }

    const exportDir = createExportDir();
    const fileName = `users_export_${Date.now()}.csv`;
    const csvFilePath = path.join(exportDir, fileName);

    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'nom', title: 'Nom' },
        { id: 'prenom', title: 'Prénom' },
        { id: 'email', title: 'Email' },
        { id: 'role', title: 'Rôle' },
        { id: 'dateCreation', title: 'Date de Création' }
      ]
    });

    const records = users.map(user => ({
      id: user._id.toString(),
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      role: user.role || '',
      dateCreation: formatDate(user.createdAt)
    }));

    await csvWriter.writeRecords(records);

    res.download(csvFilePath, fileName, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du fichier:', err);
        return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
      }
      fs.unlinkSync(csvFilePath);
    });
  } catch (error) {
    console.error('Erreur lors de l\'exportation des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};

// Export Users XLSX (Nouveau)
exports.exportUsersXLSX = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur trouvé avec ces critères' });
    }

    const exportDir = createExportDir();
    const fileName = `users_export_${Date.now()}.xlsx`;
    const xlsxFilePath = path.join(exportDir, fileName);

    const workbook = XLSX.utils.book_new();
    const userData = users.map(user => ({
      ID: user._id.toString(),
      'Nom': user.nom || '',
      'Prénom': user.prenom || '',
      'Email': user.email || '',
      'Rôle': user.role || '',
      'Date de Création': formatDate(user.createdAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(userData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Utilisateurs');
    XLSX.writeFile(workbook, xlsxFilePath);

    res.download(xlsxFilePath, fileName, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du fichier:', err);
        return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
      }
      fs.unlinkSync(xlsxFilePath);
    });
  } catch (error) {
    console.error('Erreur lors de l\'exportation des utilisateurs en XLSX:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};

// Export Users JSON (Nouveau)
exports.exportUsersJSON = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur trouvé avec ces critères' });
    }

    const userData = users.map(user => ({
      id: user._id.toString(),
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      role: user.role || '',
      dateCreation: formatDate(user.createdAt)
    }));

    res.json(userData);
  } catch (error) {
    console.error('Erreur lors de l\'exportation des utilisateurs en JSON:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
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

    const exportDir = createExportDir();
    const fileName = `dashboard_export_${Date.now()}.csv`;
    const csvFilePath = path.join(exportDir, fileName);

    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'metrique', title: 'Métrique' },
        { id: 'valeur', title: 'Valeur' },
        { id: 'periode', title: 'Période' }
      ]
    });

    const periode = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`
      : 'Toutes les données';

    const records = [
      { metrique: 'Nombre total de clients', valeur: clientCount, periode },
      { metrique: 'Nombre total de tickets', valeur: ticketCount, periode },
      { metrique: 'Tickets ouverts', valeur: openTicketCount, periode },
      { metrique: 'Tickets fermés', valeur: closedTicketCount, periode }
    ];

    await csvWriter.writeRecords(records);

    res.download(csvFilePath, fileName, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du fichier:', err);
        return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
      }
      fs.unlinkSync(csvFilePath);
    });
  } catch (error) {
    console.error('Erreur lors de l\'exportation des données du dashboard:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};

// Export Dashboard XLSX (Nouveau)
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

    const exportDir = createExportDir();
    const fileName = `dashboard_export_${Date.now()}.xlsx`;
    const xlsxFilePath = path.join(exportDir, fileName);

    const workbook = XLSX.utils.book_new();
    
    const periode = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`
      : 'Toutes les données';

    const dashboardData = [
      { 'Métrique': 'Nombre total de clients', 'Valeur': clientCount, 'Période': periode },
      { 'Métrique': 'Nombre total de tickets', 'Valeur': ticketCount, 'Période': periode },
      { 'Métrique': 'Tickets ouverts', 'Valeur': openTicketCount, 'Période': periode },
      { 'Métrique': 'Tickets fermés', 'Valeur': closedTicketCount, 'Période': periode }
    ];

    const worksheet = XLSX.utils.json_to_sheet(dashboardData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard');
    XLSX.writeFile(workbook, xlsxFilePath);

    res.download(xlsxFilePath, fileName, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du fichier:', err);
        return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
      }
      fs.unlinkSync(xlsxFilePath);
    });
  } catch (error) {
    console.error('Erreur lors de l\'exportation des données du dashboard en XLSX:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};

// Export Dashboard JSON (Nouveau)
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
// Export prospect CSV
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
    if (prospects.length === 0) {
      return res.status(404).json({ message: 'Aucun prospect trouvé avec ces critères' });
    }

    const exportDir = createExportDir();
    const fileName = `prospects_export_${Date.now()}.csv`;
    const csvFilePath = path.join(exportDir, fileName);

    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'nom', title: 'Nom' },
        { id: 'email', title: 'Email' },
        { id: 'telephone', title: 'Téléphone' },
        { id: 'societe', title: 'Société' },
        { id: 'status', title: 'Statut' },
        { id: 'dateCreation', title: 'Date de Création' }
      ]
    });

    const records = prospects.map(p => ({
      id: p._id.toString(),
      nom: p.nom || '',
      email: p.email || '',
      telephone: p.telephone || '',
      societe: p.societe || '',
      status: p.status || '',
      dateCreation: formatDate(p.createdAt)
    }));

    await csvWriter.writeRecords(records);

    res.download(csvFilePath, fileName, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du fichier:', err);
        return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
      }
      fs.unlinkSync(csvFilePath);
    });
  } catch (error) {
    console.error('Erreur lors de l\'exportation des prospects en CSV:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};
// Export prospect XLSX
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
    if (prospects.length === 0) {
      return res.status(404).json({ message: 'Aucun prospect trouvé avec ces critères' });
    }

    const exportDir = createExportDir();
    const fileName = `prospects_export_${Date.now()}.xlsx`;
    const xlsxFilePath = path.join(exportDir, fileName);

    const workbook = XLSX.utils.book_new();
    const data = prospects.map(p => ({
      ID: p._id.toString(),
      Nom: p.nom || '',
      Email: p.email || '',
      Téléphone: p.telephone || '',
      Société: p.societe || '',
      Statut: p.status || '',
      'Date de Création': formatDate(p.createdAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prospects');
    XLSX.writeFile(workbook, xlsxFilePath);

    res.download(xlsxFilePath, fileName, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du fichier:', err);
        return res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
      }
      fs.unlinkSync(xlsxFilePath);
    });
  } catch (error) {
    console.error('Erreur lors de l\'exportation des prospects en XLSX:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'exportation' });
  }
};
// Export prospect json
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
