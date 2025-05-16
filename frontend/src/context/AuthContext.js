// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

// Créer le contexte
export const AuthContext = createContext();

// Créer un provider pour le contexte
export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier le token au chargement
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuth(true);
        
        // Essayer de récupérer les informations utilisateur
        try {
          const userRole = localStorage.getItem('userRole');
          const userId = localStorage.getItem('userId');
          
          if (userRole && userId) {
            setUser({ role: userRole, id: userId });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des infos utilisateur', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Fonction pour vérifier l'authentification
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  // Fonction de connexion
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    
    if (userData) {
      if (userData.role) localStorage.setItem('userRole', userData.role);
      if (userData.id) localStorage.setItem('userId', userData.id);
      setUser(userData);
    }
    
    setIsAuth(true);
    return true;
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setUser(null);
    setIsAuth(false);
  };

  // Les valeurs exposées par le contexte
  const contextValue = {
    isAuth,
    user,
    loading,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;