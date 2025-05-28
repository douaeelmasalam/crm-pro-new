const Client = require('../Models/Client');

// Gestion des erreurs
const handleError = (error, res) => {
  console.error('Erreur:', error);
  return res.status(500).json({
    success: false,
    message: error.message || 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? error : {}
  });
};

// Récupérer tous les clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find({})
      .select('_id nomCommercial nomPrenom') // Only select these fields for efficiency
      .sort({ nomCommercial: 1 }); // Sort alphabetically by commercial name

    // Format the data for react-select
    const formattedClients = clients.map(client => ({
      value: client._id,
      label: client.nomCommercial || client.nomPrenom || 'Unnamed Client' // Fallback to nomPrenom if nomCommercial doesn't exist
    }));

    res.status(200).json(formattedClients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error: error.message });
  }
};
// Récupérer un client par ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    res.status(200).json(client);
  } catch (error) {
    return handleError(error, res);
  }
};

// Créer un nouveau client
exports.createClient = async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      ficheClient: {
        paie: req.body.paie,
        datePremierBilan: new Date(req.body.datePremierBilan),
        regimeTVA: req.body.regimeTVA,
        regimeIS: req.body.regimeIS
      }
    };

    const client = await Client.create(clientData);
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ 
      message: 'Erreur de création',
      error: error.message
    });
  }
};

// Mettre à jour un client existant
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Client mis à jour avec succès',
      data: client
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    return handleError(error, res);
  }
};

// Supprimer un client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Client supprimé avec succès'
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// Mettre à jour la fiche client
exports.updateFicheClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    client.ficheClient = req.body;
    await client.save();
    
    res.status(200).json({
      success: true,
      message: 'Fiche client mise à jour avec succès',
      data: client.ficheClient
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// Ajouter un nouveau bilan
exports.addBilan = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    client.bilans.push(req.body);
    await client.save();
    
    res.status(201).json({
      success: true,
      message: 'Bilan ajouté avec succès',
      data: client.bilans[client.bilans.length - 1]
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// Ajouter un nouvel organisme
exports.addOrganisme = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    client.organismes.push(req.body);
    await client.save();
    
    res.status(201).json({
      success: true,
      message: 'Organisme ajouté avec succès',
      data: client.organismes[client.organismes.length - 1]
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// Récupérer tous les bilans d'un client
exports.getClientBilans = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('bilans');
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      count: client.bilans.length,
      data: client.bilans
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// Récupérer tous les organismes d'un client
exports.getClientOrganismes = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('organismes');
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      count: client.organismes.length,
      data: client.organismes
    });
  } catch (error) {
    return handleError(error, res);
  }
};