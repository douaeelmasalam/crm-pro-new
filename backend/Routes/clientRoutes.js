// Vérifiez d'abord que votre fichier Routes/clientRoutes.js est correctement configuré
// Exemple de Routes/clientRoutes.js

const express = require('express');
const router = express.Router();
const Client = require('../Models/Client'); // Assurez-vous que le chemin est correct

// Récupérer tous les clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer un nouveau client
router.post('/', async (req, res) => {
  console.log('Requête de création de client reçue:', req.body);
  
  const client = new Client({
    nom: req.body.nom,
    email: req.body.email,
    telephone: req.body.telephone,
    adresse: req.body.adresse,
    siret: req.body.siret,
    // Ajoutez d'autres champs selon votre modèle
  });

  try {
    const nouveauClient = await client.save();
    res.status(201).json(nouveauClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Récupérer un client spécifique
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un client
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un client
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;