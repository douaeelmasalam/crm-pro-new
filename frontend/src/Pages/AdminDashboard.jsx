import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminDashboard.css';
import '../styles/Userform.css';
import CreateUserForm from '../components/CreateUserForm';
import UserList from '../components/UserList';
import ProspectForm from '../components/ProspectForm';
import CombinedClientsList from '../components/ClientsList';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    users: 6,
    tickets: 15,
    openTickets: 8,
    clients: 0,
    prospects: 0
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchStats();
    
    if (location.state && location.state.activeSection) {
      setActiveSection(location.state.activeSection);
    }
  }, [location]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const prospectsRes = await axios.get(`${API_URL}/prospects`);
      const clientsRes = await axios.get(`${API_URL}/clients`);
      
      setStats(prevStats => ({
        ...prevStats,
        prospects: prospectsRes.data.length,
        clients: clientsRes.data.length
      }));
      
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (id) => {
    navigate(`/admin/edit-user/${id}`);
  };

  const handleUserUpdated = () => {
    setActiveSection('users');
    navigate('/admin/dashboard', { state: { activeSection: 'users' } });
  };

  const handleProspectUpdated = () => {
    fetchStats();
    setActiveSection('prospects');
  };

  const handleClientUpdated = () => {
    fetchStats();
    setActiveSection('clients');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <h2>Dashboard Overview</h2>
            {loading ? (
              <div className="loading">Chargement des statistiques...</div>
            ) : (
              <div className="stats-container">
                <div className="stat-card">
                  <h3>Users</h3>
                  <p className="stat-value">{stats.users}</p>
                </div>
                <div className="stat-card">
                  <h3>Tickets</h3>
                  <p className="stat-value">{stats.tickets}</p>
                  <p className="stat-sub">{stats.openTickets} open</p>
                </div>
                <div className="stat-card">
                  <h3>Clients</h3>
                  <p className="stat-value">{stats.clients}</p>
                </div>
                <div className="stat-card">
                  <h3>Prospects</h3>
                  <p className="stat-value">{stats.prospects}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'users':
        return (
          <div>
            <h2>User Data</h2>
            <UserList onEditUser={handleEditUser} />
          </div>
        );

      case 'createUser':
        return (
          <div>
            <h2>Create User</h2>
            <CreateUserForm onUserUpdated={handleUserUpdated} />
          </div>
        );

      case 'tickets':
        return (
          <div>
            <h2>Tickets</h2>
            <p>Ticket list will be implemented here.</p>
          </div>
        );

      case 'createTicket':
        return (
          <div>
            <h2>Create Ticket</h2>
            <p>Ticket creation form will be implemented here.</p>
          </div>
        );

      case 'clients':
        return (
          <div>
            <CombinedClientsList onClientUpdated={handleClientUpdated} />
          </div>
        );

      case 'prospects':
        return (
          <div>
            <h2>Gestion des Prospects</h2>
            <ProspectForm onProspectUpdated={handleProspectUpdated} />
          </div>
        );

      case 'documents':
        return (
          <div>
            <h2>Documents</h2>
            <p>Document management will be implemented here.</p>
          </div>
        );

      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h1>CRM-PRO</h1>
          <p>Admin Panel</p>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li 
              className={activeSection === 'dashboard' ? 'active' : ''} 
              onClick={() => setActiveSection('dashboard')}
            >
              Dashboard
            </li>
            <li 
              className={activeSection === 'users' ? 'active' : ''} 
              onClick={() => setActiveSection('users')}
            >
              User Data
            </li>
            <li 
              className={activeSection === 'createUser' ? 'active' : ''} 
              onClick={() => setActiveSection('createUser')}
            >
              Create/Edit User
            </li>
            <li 
              className={activeSection === 'tickets' ? 'active' : ''} 
              onClick={() => setActiveSection('tickets')}
            >
              Tickets
            </li>
            <li 
              className={activeSection === 'createTicket' ? 'active' : ''} 
              onClick={() => setActiveSection('createTicket')}
            >
              Create Ticket
            </li>
            <li 
              className={activeSection === 'clients' ? 'active' : ''} 
              onClick={() => {
                setActiveSection('clients');
                fetchStats();
              }}
            >
              Fiches Clients
            </li>
            <li 
              className={activeSection === 'prospects' ? 'active' : ''} 
              onClick={() => {
                setActiveSection('prospects');
                fetchStats();
              }}
            >
              Prospects
            </li>
            <li 
              className={activeSection === 'documents' ? 'active' : ''} 
              onClick={() => setActiveSection('documents')}
            >
              Documents
            </li>
          </ul>
        </nav>
      </div>

      <div className="admin-content">
        <header className="admin-header">
          <h2>Admin Dashboard</h2>
          <div className="user-info">
            <span>Admin User</span>
            <button className="logout-btn">Logout</button>
          </div>
        </header>
        <main className="content-area">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;