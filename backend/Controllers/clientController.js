const Client = require('../Models/ClientModel');

// Get all clients
const getClients = async (req, res) => {
  try {
    const clients = await Client.find({});
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get client by ID
const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new client
const createClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json({ message: 'Client removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};