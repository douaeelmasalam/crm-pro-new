const User = require('../Models/User.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // 2. Comparer le mot de passe hashé
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // 3. Créer un token JWT avec plus d'informations
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Définir les permissions selon le rôle
    const permissions = getPermissionsForRole(user.role);

    // 5. Réponse réussie avec informations détaillées
    res.status(200).json({
      message: 'login successful',
      token,
      // Garder la compatibilité avec l'ancien format
      role: user.role,
      userId: user._id,
      email: user.email,
      // Nouveau format détaillé
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        permissions
      }
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Fonction pour définir les permissions selon le rôle
const getPermissionsForRole = (role) => {
  const permissions = {
    admin: {
      canViewAllUsers: true,
      canCreateUsers: true,
      canViewAllTickets: true,
      canCreateTickets: true,
      canViewAllClients: true,
      canViewAllProspects: true,
      canViewAllDocuments: true,
      sections: ['dashboard', 'userData', 'createUser', 'tickets', 'createTicket', 'fichesClients', 'prospects', 'documents']
    },
    user: {
      canViewAllUsers: false,
      canCreateUsers: false,
      canViewAllTickets: false,
      canCreateTickets: false,
      canViewAllClients: false,
      canViewAllProspects: false,
      canViewAllDocuments: false,
      sections: ['dashboard', 'tickets', 'prospects', 'documents']
    }
  };
  return permissions[role] || permissions.user;
};

// Nouvelle route pour obtenir les informations de l'utilisateur connecté
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const permissions = getPermissionsForRole(user.role);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        permissions
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { 
  login, 
  getProfile,
  getPermissionsForRole 
};