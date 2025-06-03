import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPlus, FaDownload, FaLock } from 'react-icons/fa';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/AdminDashboard.css';
import '../styles/Userform.css';
import CreateUserForm from '../components/CreateUserForm';
import UserList from '../components/UserList';
import ProspectForm from '../components/ProspectForm';
import CreateTicketForm from '../components/CreateTicketForm';
import TicketList from '../components/TicketList';
import ClientForm from '../components/ClientForm';
import ClientList from '../components/ClientList';
import TicketEvolutionForecastChart from '../components/TicketEvolutionForecastChart';
import ExportDataForm from '../components/ExportDataForm';
import TicketsClientChart from '../components/TicketsClientChart';
import TicketsByUserChart from '../components/TicketsByUserChart';
import DocumentsSection from '../components/DocumentsSection';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = ({ userRole: propUserRole, userPermissions: propUserPermissions, userSections: propUserSections, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('');
  
  // Utiliser les props reçues d'App.js ou les valeurs par défaut
  const [userRole, setUserRole] = useState(propUserRole || '');
  const [userInfo, setUserInfo] = useState({});
  const [userPermissions, setUserPermissions] = useState(propUserPermissions || {});

  const [stats, setStats] = useState({
    users: 0,
    tickets: 0,
    ouvertTickets: 0,
    enCoursTickets: 0,
    resoluTickets: 0,
    fermeTickets: 0,
    clients: 0,
    prospects: 0
  });
  const [tickets, setTickets] = useState([]);
  const [ticketPriorityData, setTicketPriorityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [isCreatingClient, setIsCreatingClient] = useState(false);  

  const navigate = useNavigate();
  const location = useLocation();

  // Mettre à jour les états locaux quand les props changent
  useEffect(() => {
    if (propUserRole) setUserRole(propUserRole);
    if (propUserPermissions) setUserPermissions(propUserPermissions);
  }, [propUserRole, propUserPermissions, propUserSections]);

  // Configuration des sections selon le rôle
  const getSectionsForRole = (role) => {
    const allSections = [
      { id: 'dashboard', name: 'Dashboard', icon: '', adminOnly: false },
      { id: 'users', name: 'User Data', icon: '', adminOnly: true },
      { id: 'createUser', name: 'Create User', icon: '', adminOnly: true },
      { id: 'tickets', name: 'Tickets', icon: '', adminOnly: false },
      { id: 'createTicket', name: 'Create Ticket', icon: '', adminOnly: false },
      { id: 'clients', name: 'Fiches Clients', icon: '', adminOnly: true },
      { id: 'prospects', name: 'Prospects', icon: '', adminOnly: false },
      { id: 'documents', name: 'Documents', icon: '', adminOnly: false }
    ];

    if (role === 'admin') {
      return allSections;
    } else if (role === 'user') {
      return allSections.filter(section => !section.adminOnly);
    }
    
    return [];
  };

  // Fonction pour vérifier les permissions
  const hasPermission = (action) => {
    return userPermissions[action] || false;
  };

  // Fonction pour récupérer les informations utilisateur
  const fetchUserInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        if (onLogout) {
          onLogout();
        } else {
          navigate('/login');
        }
        return;
      }

      // Si les props sont déjà définies, utiliser celles-ci
      if (propUserRole && propUserPermissions) {
        setUserRole(propUserRole);
        setUserPermissions(propUserPermissions);
        
        // Récupérer les infos utilisateur du localStorage
        const userEmail = localStorage.getItem('userEmail');
        const userId = localStorage.getItem('userId');
        
        setUserInfo({
          userId: userId,
          email: userEmail,
          role: propUserRole
        });
        return;
      }

      // Sinon, décoder le token (fallback)
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      setUserRole(tokenData.role || 'user');
      setUserInfo({
        userId: tokenData.userId,
        email: tokenData.email,
        role: tokenData.role || 'user'
      });

      // Définir les permissions selon le rôle si pas déjà définies
      if (!propUserPermissions) {
        const permissions = {
          admin: {
            canViewAllUsers: true,
            canCreateUsers: true,
            canViewAllTickets: true,
            canCreateTickets: true,
            canViewAllClients: true,
            canViewAllProspects: true,
            canViewAllDocuments: true
          },
          user: {
            canViewAllUsers: false,
            canCreateUsers: false,
            canViewAllTickets: false,
            canCreateTickets: true,
            canViewAllClients: false,
            canViewAllProspects: true,
            canViewAllDocuments: true
          }
        };

        setUserPermissions(permissions[tokenData.role] || permissions.user);
      }

    } catch (error) {
      console.error('Erreur lors de la récupération des infos utilisateur:', error);
      if (onLogout) {
        onLogout();
      } else {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [navigate, onLogout, propUserRole, propUserPermissions]);

  // Fonction de déconnexion
  const handleLogout = () => {
    console.log('[AdminDashboard] Déconnexion demandée');
    if (onLogout) {
      onLogout(); // Utiliser la fonction onLogout d'App.js
    } else {
      // Fallback si onLogout n'est pas disponible
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPermissions');
      localStorage.removeItem('userSections');
      localStorage.removeItem('userInfo');
      navigate('/login');
    }
  };

  // Couleurs pour le pie chart
  const PRIORITY_COLORS = {
    faible: '#10b9cf',
    moyenne: '#2b6976',   
    élevée: '#f59e0b',    
    critique: '#7d3c98'
  };

  // Modal component pour l'export
  const ExportModal = ({ isOpen, onClose, exportType }) => {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Exporter les données</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <ExportDataForm exportType={exportType} />
          </div>
        </div>
      </div>
    );
  };

  const fetchAllStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // Adapter les requêtes selon le rôle
      const requests = [];
      
      // Tous les utilisateurs peuvent voir prospects et documents
      requests.push(
        axios.get(`${API_URL}/prospects`, { headers }),
        axios.get(`${API_URL}/tickets`, { headers })
      );
      
      // Seuls les admins peuvent voir clients et users
      if (userRole === 'admin') {
        requests.push(
          axios.get(`${API_URL}/clients`, { headers }),
          axios.get(`${API_URL}/users`, { headers })
        );
      }
      
      const results = await Promise.allSettled(requests);
      
      const prospectsData = results[0].status === 'fulfilled' ? results[0].value.data : [];
      const ticketsData = results[1].status === 'fulfilled' ? results[1].value.data : [];
      const clientsData = userRole === 'admin' && results[2] ? 
        (results[2].status === 'fulfilled' ? results[2].value.data : []) : [];
      const usersData = userRole === 'admin' && results[3] ? 
        (results[3].status === 'fulfilled' ? results[3].value.data : []) : [];
      
      updateStats(prospectsData, clientsData, usersData, ticketsData);
      generateTicketPriorityData(ticketsData);
      setTickets(ticketsData);
      
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
      setError('Erreur lors du chargement des statistiques. Veuillez réessayer.');
      setTicketPriorityData([]);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    if (userRole) {
      fetchAllStats();
    }
    if (location.state && location.state.activeSection) {
      setActiveSection(location.state.activeSection);
    }
  }, [location, fetchAllStats, userRole]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleLogout();
    }
  }, []);

  const updateStats = (prospects, clients, users, tickets) => {
    const ouvertTickets = tickets.filter(ticket => 
      ticket.status === 'ouvert' || 
      ticket.status === 'Ouvert' || 
      ticket.status === 'pending' || 
      ticket.status === 'En attente' || 
      (ticket.status && ticket.status.toLowerCase() === 'ouvert')
    ).length;
    
    const enCoursTickets = tickets.filter(ticket => 
      ticket.status === 'en cours' || 
      ticket.status === 'En Cours' || 
      ticket.status === 'En cours' || 
      ticket.status === 'in-progress' || 
      (ticket.status && ticket.status.toLowerCase() === 'en cours')
    ).length;
    
    const resoluTickets = tickets.filter(ticket => 
      ticket.status === 'résolu' || 
      ticket.status === 'Résolu' || 
      ticket.status === 'resolved' || 
      (ticket.status && ticket.status.toLowerCase() === 'résolu')
    ).length;
    
    const fermeTickets = tickets.filter(ticket => 
      ticket.status === 'fermé' || 
      ticket.status === 'Fermé' || 
      ticket.status === 'closed' || 
      (ticket.status && ticket.status.toLowerCase() === 'fermé')
    ).length;
    
    setStats({
      prospects: prospects.length,
      clients: clients.length,
      users: users.length,
      tickets: tickets.length,
      ouvertTickets,
      enCoursTickets,
      resoluTickets,
      fermeTickets
    });
  };

  const fetchClients = async () => {
    if (!hasPermission('canViewAllClients')) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Clients loaded:', response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
      setError('Erreur lors du chargement des clients. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const generateTicketPriorityData = (tickets) => {
    if (!Array.isArray(tickets) || tickets.length === 0) {
      setTicketPriorityData([]);
      return;
    }
    
    const priorityCounts = {
      faible: 0,
      moyenne: 0,
      élevée: 0, 
      critique: 0
    };
    
    tickets.forEach(ticket => {
      if (ticket.priority) {
        let priority = ticket.priority.toLowerCase();
        
        if (priority === 'elevee' || priority === 'elevée' || priority === 'élevee') {
          priority = 'élevée';
        }
        
        if (priorityCounts.hasOwnProperty(priority)) {
          priorityCounts[priority]++;
        }
      }
    });
    
    const data = Object.keys(priorityCounts).map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: priorityCounts[priority],
      color: PRIORITY_COLORS[priority]
    }));
    
    const filteredData = data.filter(item => item.value > 0);
    
    setTicketPriorityData(filteredData);
  };

  const handleEditUser = (id) => {
    if (!hasPermission('canViewAllUsers')) return;
    navigate(`/admin/edit-user/${id}`);
  };

  const handleUserUpdated = () => {
    setActiveSection('users');
    navigate('/admin/dashboard', { state: { activeSection: 'users' } });
    fetchAllStats();
  };

  const handleProspectUpdated = () => {
    fetchAllStats();
    setActiveSection('prospects');
  };

  const handleSaveClient = () => {
    fetchClients();
    fetchAllStats();
    setSelectedClientId(null);
    setIsCreatingClient(false);
  };

  const handleCancelClient = () => {
    setSelectedClientId(null);
    setIsCreatingClient(false);
  };

  const handleTicketUpdated = () => {
    fetchAllStats();
  };

  const handleClientDeleted = () => {
    fetchClients();
    fetchAllStats();
  };

  const handleExportClick = (type) => {
    setExportType(type);
    setShowExportModal(true);
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false);
    setExportType('');
  };

  // Fonction pour vérifier si une section est accessible
  const isSectionAccessible = (sectionId) => {
    const visibleSections = getSectionsForRole(userRole);
    return visibleSections.some(section => section.id === sectionId);
  };

  const StatCard = ({ title, value, className = '' }) => (
    <div className={`stat-card ${className}`}>
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
    </div>
  );

  const TicketStatCard = ({ title, value, status = '' }) => (
    <div className={`ticket-stat-card ${status}`}>
      <h3>{title}</h3>
      <p className="ticket-stat-value">{value}</p>
    </div>
  );

  const TicketPriorityChart = () => (
    <div className="ticket-priority-chart" style={{ width: '100%', height: 250 }}>
      {ticketPriorityData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ticketPriorityData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {ticketPriorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} ticket(s)`, 'Quantité']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="no-data">Aucune donnée disponible</div>
      )}
    </div>
  );

  const renderDashboard = () => {
    return (
      <div className="dashboard-content">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Dashboard Overview</h2>
          <button 
            className="export-dashboard-btn"
            onClick={() => handleExportClick('dashboard')}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaDownload /> Exporter Dashboard
          </button>
        </div>
        
        {loading ? (
          <div className="loading">Chargement des statistiques...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="stats-container">
              {hasPermission('canViewAllUsers') && (
                <StatCard title="Users" value={stats.users} />
              )}
              {hasPermission('canViewAllClients') && (
                <StatCard title="Clients" value={stats.clients} />
              )}
              <StatCard title="Prospects" value={stats.prospects} />
            </div>
            
            <div className="ticket-stats-container">
              <TicketStatCard title="Total Tickets" value={stats.tickets} />
              <TicketStatCard title="Ouvert" value={stats.ouvertTickets} status="ouvert" />
              <TicketStatCard title="En cours" value={stats.enCoursTickets} status="en-cours" />
              <TicketStatCard title="Résolu" value={stats.resoluTickets} status="resolu" />
              <TicketStatCard title="Fermé" value={stats.fermeTickets} status="ferme" />
            </div>

            <div className="chart-card" style={{ flex: '1 1 100%' }}>
              <div className="chart-card" style={{ flex: '1 1 100%', marginBottom: '20px' }}>
                <TicketsByUserChart apiUrl={API_URL} />
              </div>
              
              {hasPermission('canViewAllClients') && (
                <TicketsClientChart 
                  apiUrl={API_URL} 
                  chartType="bar" 
                  showMetrics={false} 
                />
              )}
            </div>
            
            <div className="charts-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <div className="chart-card" style={{ flex: '1 1 450px' }}>
                <h3>Évolution des tickets</h3>
                <TicketEvolutionForecastChart 
                  tickets={tickets} 
                  fetchUrl={`${API_URL}/tickets`} 
                />
              </div>
              
              <div className="chart-card" style={{ flex: '1 1 450px' }}>
                <h3>Répartition des tickets par priorité</h3>
                <TicketPriorityChart />
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderClientsSection = () => {
    if (!hasPermission('canViewAllClients')) {
      return (
        <div className="access-denied">
          <FaLock size={48} color="#e74c3c" />
          <h3>Accès refusé</h3>
          <p>Vous n'avez pas les permissions nécessaires pour accéder aux fiches clients.</p>
        </div>
      );
    }

    return (
      <div className="clients-section">
        <h2>Fiches Clients</h2>
        
        {isCreatingClient || selectedClientId ? (
          <ClientForm 
            clientId={selectedClientId} 
            onSave={handleSaveClient} 
            onCancel={handleCancelClient} 
          />
        ) : (
          <div className="client-list-wrapper">
            <div className="client-list-actions">
              <button 
                className="btn-primary"
                onClick={() => setIsCreatingClient(true)}
              >
                <FaPlus /> Créer un nouveau client
              </button>
            </div>
            
            <ClientList 
              onEditClient={(id) => setSelectedClientId(id)}
              onClientDeleted={handleClientDeleted}
            />
          </div>
        )}
      </div>
    );
  };

  const renderSection = () => {
    // Vérifier l'accès à la section
    if (!isSectionAccessible(activeSection)) {
      return (
        <div className="access-denied">
          <FaLock size={48} color="#e74c3c" />
          <h3>Accès refusé</h3>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'users': return (
        <div>
          <h2>User Data</h2>
          <UserList onEditUser={handleEditUser} />
        </div>
      );
      case 'createUser': return (
        <div>
          <CreateUserForm onUserUpdated={handleUserUpdated} />
        </div>
      );
      case 'tickets': return (
        <div>
          <h2>Tickets</h2>
          <TicketList onTicketUpdated={handleTicketUpdated} />
        </div>
      );
      case 'createTicket': return (
        <div>
          <h2>Create Ticket</h2>
          <CreateTicketForm onTicketCreated={handleTicketUpdated} />
        </div>
      );
      case 'clients': return renderClientsSection();
      case 'prospects': return (
        <div>
          <h2>Gestion des Prospects</h2>
          <ProspectForm onProspectUpdated={handleProspectUpdated} />
        </div>
      );
      case 'documents': return (
        <div>
        
         
           <DocumentsSection />
        </div>
      );
      default: return <div>Select a section</div>;
    }
  };

  const refreshData = () => {
    fetchAllStats();
    if (activeSection === 'clients' && hasPermission('canViewAllClients')) {
      fetchClients();
    }
  };

  const visibleSections = getSectionsForRole(userRole);

  
  return (
  <div className={`admin-container ${userRole}`} data-role={userRole}>
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h1>CRM-MIACORP</h1>
        <div className="user-info">
          <p> <strong>{userRole}</strong></p>
          <p>{userInfo.email}</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {visibleSections.map(section => (
            <li 
              key={section.id}
              className={activeSection === section.id ? 'active' : ''} 
              onClick={() => {
                setActiveSection(section.id);
                if (section.id === 'tickets' || section.id === 'clients' || section.id === 'prospects') {
                  fetchAllStats();
                }
              }}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-text">{section.name}</span>
            </li>
          ))}
        </ul>
        {/* Bouton de déconnexion ajouté après la liste des sections */}
        <div className="logout-container">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon"><FaLock /></span>
            <span className="nav-text">Log Out</span>
          </button>
        </div>
      </nav>
    </div>

      <div className="admin-content">
        <header className="admin-header">
          <h2>
            {userRole === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
            {userRole === 'user' && (
              <span className="access-badge"> Accès limité</span>
            )}
          </h2>
          <div className="user-info">
            <button className="refresh-btn" onClick={refreshData}>
              Rafraîchir les données
            </button>
            {/* Suppression du bouton de déconnexion de l'en-tête */}
          </div>
        </header>
        <main className="content-area">
          {renderSection()}
        </main>
      </div>

      <ExportModal 
        isOpen={showExportModal} 
        onClose={handleCloseExportModal} 
        exportType={exportType} 
      />
    </div>
  );
};

export default AdminDashboard;