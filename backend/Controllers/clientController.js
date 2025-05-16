const Client = require('../Models/Client');
const { validationResult } = require('express-validator');

// Obtenir tous les clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Obtenir un client par ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Créer un nouveau client
exports.createClient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const newClient = new Client(req.body);
    const savedClient = await newClient.save();
    
    res.status(201).json({
      success: true,
      data: savedClient,
      message: 'Client créé avec succès'
    });
  } catch (error) {
    console.error(error);
    
    // Gestion de l'erreur de duplication pour le SIRET
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Un client avec ce SIRET existe déjà'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du client',
      error: error.message
    });
  }
};

// Mettre à jour un client
exports.updateClient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

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
      data: client,
      message: 'Client mis à jour avec succès'
    });
  } catch (error) {
    console.error(error);
    
    // Gestion de l'erreur de duplication pour le SIRET
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Un client avec ce SIRET existe déjà'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du client',
      error: error.message
    });
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
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du client',
      error: error.message
    });
  }
};

// Ajouter un bilan à un client
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
    
    res.status(200).json({
      success: true,
      data: client,
      message: 'Bilan ajouté avec succès'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du bilan',
      error: error.message
    });
  }
};

// Ajouter un organisme à un client
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
    
    res.status(200).json({
      success: true,
      data: client,
      message: 'Organisme ajouté avec succès'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'organisme',
      error: error.message
    });
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
      data: client,
      message: 'Fiche client mise à jour avec succès'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la fiche client',
      error: error.message
    });
  }
};