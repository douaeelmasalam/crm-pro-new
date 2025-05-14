import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import TicketEvolutionForecastChart from '../components/TicketEvolutionForecastChart'; // Import the new chart component

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
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
  const [clients, setClients] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Couleurs pour le pie chart
  const PRIORITY_COLORS = {
    faible: '#10b9cf',    // vert
    moyenne: '#2b6976',   
    élevée: '#f59e0b',    
    critique: '#7d3c98'   // violet
  };

  useEffect(() => {
    const fetchStats = () => {
      fetchAllStats();
    };
    fetchStats();
    if (location.state && location.state.activeSection) {
      setActiveSection(location.state.activeSection);
    }
  }, [location]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchAllStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await Promise.allSettled([
        axios.get(`${API_URL}/prospects`),
        axios.get(`${API_URL}/clients`),
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/tickets`)
      ]);
      
      const prospectsData = results[0].status === 'fulfilled' ? results[0].value.data : [];
      const clientsData = results[1].status === 'fulfilled' ? results[1].value.data : [];
      const usersData = results[2].status === 'fulfilled' ? results[2].value.data : [];
      const ticketsData = results[3].status === 'fulfilled' ? results[3].value.data : [];
      
      updateStats(prospectsData, clientsData, usersData, ticketsData);
      generateTicketPriorityData(ticketsData);
      setTickets(ticketsData);
      
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Erreur lors du chargement des statistiques. Veuillez réessayer.');
      setTicketPriorityData([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (prospects, clients, users, tickets) => {
    // On normalise les statuts pour compter correctement selon les nouveaux statuts
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
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/clients`);
      setClients(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
      setError('Erreur lors du chargement des clients. Veuillez réessayer.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const generateTicketPriorityData = (tickets) => {
    if (!Array.isArray(tickets) || tickets.length === 0) {
      setTicketPriorityData([]);
      return;
    }
    
    // Comptage des tickets par priorité
    const priorityCounts = {
      faible: 0,
      moyenne: 0,
      élevée: 0, 
      critique: 0
    };
    
    tickets.forEach(ticket => {
      if (ticket.priority) {
        // Normaliser la priorité pour gérer les variations d'orthographe
        let priority = ticket.priority.toLowerCase();
        
        // Remplacer toutes les variantes de "elevee" par "élevée"
        if (priority === 'elevee' || priority === 'elevée' || priority === 'élevee') {
          priority = 'élevée';
        }
        
        if (priorityCounts.hasOwnProperty(priority)) {
          priorityCounts[priority]++;
        }
      }
    });
    
    // Conversion en format adapté pour le PieChart
    const data = Object.keys(priorityCounts).map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1), // Première lettre en majuscule
      value: priorityCounts[priority],
      color: PRIORITY_COLORS[priority]
    }));
    
    // Optionnel: filtrer les entrées avec valeur 0
    const filteredData = data.filter(item => item.value > 0);
    
    setTicketPriorityData(filteredData);
  };

  const handleEditUser = (id) => {
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

  const handleTicketUpdated = () => {
    fetchAllStats();
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
        <h2>Dashboard Overview</h2>
        {loading ? (
          <div className="loading">Chargement des statistiques...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="stats-container">
              <StatCard title="Users" value={stats.users} />
              <StatCard title="Clients" value={stats.clients} />
              <StatCard title="Prospects" value={stats.prospects} />
            </div>
            
            <div className="ticket-stats-container">
              <TicketStatCard title="Total Tickets" value={stats.tickets} />
              <TicketStatCard title="Ouvert" value={stats.ouvertTickets} status="ouvert" />
              <TicketStatCard title="En cours" value={stats.enCoursTickets} status="en-cours" />
              <TicketStatCard title="Résolu" value={stats.resoluTickets} status="resolu" />
              <TicketStatCard title="Fermé" value={stats.fermeTickets} status="ferme" />
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
    return (
      <div>
        <h2>Fiches Clients</h2>
        {loading ? (
          <div className="loading">Chargement des clients...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <ClientForm clients={clients} />
        )}
      </div>
    );
  };

  const renderSection = () => {
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
          <h2>Create User</h2>
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
          <h2>Documents</h2>
          <p>Document management will be implemented here.</p>
        </div>
      );
      default: return <div>Select a section</div>;
    }
  };

  const refreshData = () => {
    fetchAllStats();
    if (activeSection === 'clients') {
      fetchClients();
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h1>CRM-MIACORP</h1>
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
              onClick={() => {
                setActiveSection('tickets');
                fetchAllStats();
              }}
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
                fetchAllStats();
              }}
            >
              Fiches Clients
              </li>
            <li 
              className={activeSection === 'prospects' ? 'active' : ''} 
              onClick={() => {
                setActiveSection('prospects');
                fetchAllStats();
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
            <button className="refresh-btn" onClick={refreshData}>
              Rafraîchir les données
            </button>
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