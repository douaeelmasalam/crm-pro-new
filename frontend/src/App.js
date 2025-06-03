import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import AdminDashboard from "./Pages/AdminDashboard";
import EditUserForm from "./components/EditUserForm";
import CreateTicketForm from "./components/CreateTicketForm";
import ClientForm from "./components/ClientForm";
import ClientList from "./components/ClientList";
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(""); // "admin" ou "user"
  const [userPermissions, setUserPermissions] = useState({});
  const [userSections, setUserSections] = useState([]);
  const [message, setMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      const permissions = localStorage.getItem('userPermissions');
      const sections = localStorage.getItem('userSections');
      
      // Vérifier si le token est valide (non expiré)
      if (token && role) {
        try {
          // Décoder le token pour vérifier l'expiration
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (tokenData.exp && tokenData.exp < currentTime) {
            // Token expiré, nettoyer le localStorage
            console.log('[APP] Token expiré, déconnexion automatique');
            handleLogout();
            setIsInitialized(true);
            return;
          }
          
          console.log('[APP] Restauration de la session utilisateur');
          console.log('[APP] Rôle restauré :', role);
          
          setIsLoggedIn(true);
          setUserRole(role);
          
          if (permissions) {
            try {
              const parsedPermissions = JSON.parse(permissions);
              setUserPermissions(parsedPermissions);
              console.log('[APP] Permissions restaurées :', parsedPermissions);
            } catch (error) {
              console.error('[APP] Erreur parsing permissions :', error);
              setUserPermissions({});
            }
          }
          
          if (sections) {
            try {
              const parsedSections = JSON.parse(sections);
              setUserSections(parsedSections);
              console.log('[APP] Sections autorisées :', parsedSections);
            } catch (error) {
              console.error('[APP] Erreur parsing sections :', error);
              setUserSections([]);
            }
          }
        } catch (error) {
          console.error('[APP] Erreur lors de la vérification du token :', error);
          handleLogout();
        }
      } else {
        console.log('[APP] Aucune session utilisateur trouvée');
      }
      
      setIsInitialized(true);
    };
    
    checkAuthStatus();
  }, []);

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    console.log('[APP] Déconnexion utilisateur');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPermissions');
    localStorage.removeItem('userSections');
    localStorage.removeItem('userInfo');
    
    setIsLoggedIn(false);
    setUserRole("");
    setUserPermissions({});
    setUserSections([]);
    setMessage("");
  };

  // Route protégée avec vérification des permissions
  const PrivateRoute = ({ element, requiredPermissions = [] }) => {
    if (!isLoggedIn) {
      console.log('[APP] Accès refusé - Utilisateur non connecté');
      return <Navigate to="/login" replace />;
    }

    // Si des permissions spécifiques sont requises, les vérifier
    if (requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions[permission] === true
      );
      
      if (!hasPermission) {
        console.warn('[APP] Accès refusé - Permissions insuffisantes');
        return <Navigate to="/dashboard" replace />;
      }
    }

    return element;
  };

  // Route pour le dashboard unifié (qui s'adapte selon le rôle)
  const DashboardRoute = () => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }

    // Utiliser le même AdminDashboard mais il s'adaptera selon le rôle
    return <AdminDashboard 
      userRole={userRole}
      userPermissions={userPermissions}
      userSections={userSections}
      onLogout={handleLogout}
    />;
  };

  // Afficher un loader pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="app-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>Chargement...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Vérification de l'authentification
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <Routes>
        {/* Page d'accueil - toujours afficher login si pas connecté */}
        <Route 
  path="/" 
  element={<Navigate to="/login" replace />} 
/>
        
        {/* Page de connexion */}
      <Route 
  path="/login" 
  element={
    <Login 
      setIsLoggedIn={setIsLoggedIn} 
      setUserRole={setUserRole} 
      setMessage={setMessage} 
      message={message}
      setUserPermissions={setUserPermissions}
    />
  } 
/>
        
        {/* Dashboard unifié qui s'adapte selon le rôle */}
        <Route 
          path="/dashboard" 
          element={<DashboardRoute />} 
        />
        
        {/* Routes spécifiques pour l'admin (avec vérification des permissions) */}
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute 
              element={<Navigate to="/dashboard" replace />} 
              requiredPermissions={['canViewAllUsers']}
            />
          } 
        />
        
        <Route 
          path="/admin/edit-user/:id" 
          element={
            <PrivateRoute 
              element={<EditUserForm onLogout={handleLogout} />} 
              requiredPermissions={['canViewAllUsers']}
            />
          } 
/>

        {/* Routes pour la gestion des clients (admin seulement) */}
        <Route 
          path="/client/:id?" 
          element={
            <PrivateRoute 
              element={<ClientForm onLogout={handleLogout} />} 
              requiredPermissions={['canViewAllClients']}
            />
          } 
        />
        
        <Route 
          path="/clients" 
          element={
            <PrivateRoute 
              element={<ClientList onLogout={handleLogout} />} 
              requiredPermissions={['canViewAllClients']}
            />
          } 
        />
        
        <Route 
          path="/clients/create" 
          element={
            <PrivateRoute 
              element={<ClientForm onLogout={handleLogout} />} 
              requiredPermissions={['canViewAllClients']}
            />
          } 
        />
        
        <Route 
          path="/clients/edit/:clientId" 
          element={
            <PrivateRoute 
              element={<ClientForm onLogout={handleLogout} />} 
              requiredPermissions={['canViewAllClients']}
            />
          } 
        />

        {/* Route pour création de tickets */}
        <Route 
          path="/create-ticket" 
          element={
            <PrivateRoute 
              element={<CreateTicketForm onLogout={handleLogout} />} 
            />
          } 
        />

        {/* Route de fallback - rediriger selon l'état de connexion */}
        <Route 
          path="*" 
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;