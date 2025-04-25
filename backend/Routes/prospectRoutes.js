const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Prospect = require('../Models/Prospect');

// ✅ GET : récupérer tous les prospects
router.get('/', async (req, res) => {
  try {
    const prospects = await Prospect.find().sort({ dateCreation: -1 });
    res.json(prospects);
  } catch (err) {
    console.error('Erreur lors de la récupération des prospects :', err.message);
    res.status(500).send('Erreur serveur');
  }
});

// ✅ POST : créer un nouveau prospect
router.post('/', async (req, res) => {
  console.log('📩 Données reçues pour nouveau prospect :', req.body);
  try {
    const prospect = await Prospect.create(req.body);
    res.status(201).json(prospect);
  } catch (err) {
    console.error('❌ Erreur à la création du prospect :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT : modifier un prospect
router.put('/:id', async (req, res) => {
  const { nom, societe, email, telephone, origine, gestionnaire, statut, rappel } = req.body;

  const prospectFields = {
    ...(nom && { nom }),
    ...(societe && { societe }),
    ...(email && { email }),
    ...(telephone && { telephone }),
    ...(origine && { origine }),
    ...(gestionnaire && { gestionnaire }),
    ...(statut && { statut }),
    ...(rappel && { rappel }),
  };

  try {
    let prospect = await Prospect.findById(req.params.id);
    if (!prospect) return res.status(404).json({ msg: 'Prospect non trouvé' });

    prospect = await Prospect.findByIdAndUpdate(
      req.params.id,
      { $set: prospectFields },
      { new: true }
    );

    res.json(prospect);
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour du prospect :', err.message);
    res.status(500).send('Erreur serveur');
  }
});

// ✅ DELETE : supprimer un prospect
router.delete('/:id', async (req, res) => {
  try {
    console.log(`Tentative de suppression du prospect avec ID: ${req.params.id}`);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error(`Format d'ID invalide: ${req.params.id}`);
      return res.status(400).json({ msg: 'Format d\'identifiant invalide' });
    }

    const prospect = await Prospect.findById(req.params.id);
    
    if (!prospect) {
      console.log(`Prospect avec ID ${req.params.id} non trouvé`);
      return res.status(404).json({ msg: 'Prospect non trouvé' });
    }

    await Prospect.findByIdAndDelete(req.params.id);
    console.log(`✅ Prospect avec ID ${req.params.id} supprimé avec succès`);
    res.json({ msg: '🗑️ Prospect supprimé' });
  } catch (err) {
    console.error(`❌ Erreur détaillée lors de la suppression du prospect: ${err.stack}`);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
