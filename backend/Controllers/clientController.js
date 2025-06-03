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

// Récupérer tous les clients POUR LA LISTE
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find({})
      .select('_id nom email formeJuridique nomCommercial siret manager dateCreation')
      .sort({ nom: 1 });

    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error: error.message });
  }
};

// Récupérer tous les clients POUR SELECT (react-select)
exports.getClientsForSelect = async (req, res) => {
  try {
    const clients = await Client.find({})
      .select('_id nomCommercial nom')
      .sort({ nomCommercial: 1 });

    const formattedClients = clients.map(client => ({
      value: client._id,
      label: client.nomCommercial || client.nom || 'Unnamed Client'
    }));

    res.status(200).json(formattedClients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error: error.message });
  }
};

// Récupérer un client par ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .select('-__v') // Exclure le champ __v
      .lean(); // Convertir en objet JavaScript simple
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    // Aplatir la structure pour le frontend
    const flattenedClient = {
      ...client,
      ...client.ficheClient,
      // Si vous avez besoin des premiers bilans/organismes
      ...(client.bilans?.length > 0 ? client.bilans[0] : {}),
      ...(client.organismes?.length > 0 ? client.organismes[0] : {})
    };
    
    delete flattenedClient.ficheClient;
    delete flattenedClient.bilans;
    delete flattenedClient.organismes;
    
    res.status(200).json(flattenedClient);
  } catch (error) {
    return handleError(error, res);
  }
};

// Créer un nouveau client - FONCTION PRINCIPALE
exports.createClient = async (req, res) => {
  try {
    console.log('=== CRÉATION CLIENT ===');
    console.log('Données reçues:', JSON.stringify(req.body, null, 2));
    
    // Préparer les données pour la création
    const clientData = {
      // Informations de base obligatoires
      nom: req.body.nom,
      email: req.body.email,
      
      // Informations entreprise
      formeJuridique: req.body.formeJuridique,
      nomCommercial: req.body.nomCommercial,
      numeroRCS: req.body.numeroRCS,
      siret: req.body.siret,
      codeAPE: req.body.codeAPE,
      nomPrenom: req.body.nomPrenom,
      dateCreation: req.body.dateCreation,
      manager: req.body.manager,
      adresseSiege: req.body.adresseSiege,
      capitaleSocial: req.body.capitaleSocial,
      dateCloture: req.body.dateCloture,
      inscriptionRM: req.body.inscriptionRM
    };

    // Ajouter la fiche client si elle existe
    if (req.body.ficheClient) {
      clientData.ficheClient = {
        paie: req.body.ficheClient.paie || false,
        datePremierBilan: req.body.ficheClient.datePremierBilan,
        dateDebutMission: req.body.ficheClient.dateDebutMission,
        dateCulture: req.body.ficheClient.dateCulture,
        regimeTVA: req.body.ficheClient.regimeTVA || 'Réel normal',
        regimeIS: req.body.ficheClient.regimeIS || 'Réel normal',
        jourTVA: req.body.ficheClient.jourTVA,
        typeTVA: req.body.ficheClient.typeTVA || 'Débit',
        dateContrat: req.body.ficheClient.dateContrat,
        dateContratCN2C: req.body.ficheClient.dateContratCN2C,
        compteFiscale: req.body.ficheClient.compteFiscale || false
      };
    }

    // Ajouter les bilans si ils existent
    if (req.body.bilans && Array.isArray(req.body.bilans)) {
      clientData.bilans = req.body.bilans;
    }

    // Ajouter les organismes si ils existent
    if (req.body.organismes && Array.isArray(req.body.organismes)) {
      clientData.organismes = req.body.organismes;
    }

    console.log('Données préparées pour création:', JSON.stringify(clientData, null, 2));
    
    const client = await Client.create(clientData);
    
    console.log('Client créé avec succès:', client._id);
    
    res.status(201).json({
      success: true,
      message: 'Client créé avec succès',
      data: client
    });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation: ' + messages.join(', '),
        errors: error.errors
      });
    }
    
    res.status(400).json({ 
      success: false,
      message: 'Erreur de création',
      error: error.message
    });
  }
};

// Mettre à jour un client existant
exports.updateClient = async (req, res) => {
  try {
    console.log('=== MISE À JOUR CLIENT ===');
    console.log('ID:', req.params.id);
    console.log('Données reçues:', JSON.stringify(req.body, null, 2));
    
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true,
        upsert: false // Ne pas créer si n'existe pas
      }
    );
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    console.log('Client mis à jour avec succès:', client._id);
    
    res.status(200).json({
      success: true,
      message: 'Client mis à jour avec succès',
      data: client
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation: ' + messages.join(', '),
        errors: error.errors
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