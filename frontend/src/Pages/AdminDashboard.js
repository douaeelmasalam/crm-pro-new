import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/AdminDashboard.css';
import '../styles/Userform.css';
import CreateUserForm from '../components/CreateUserForm';
import UserList from '../components/UserList';
import ProspectForm from '../components/ProspectForm';
import CombinedClientsList from '../components/ClientsList';
import CreateTicketForm from '../components/CreateTicketForm';
import TicketList from '../components/TicketList';
const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    users: 0,
    tickets: 0,
    openTickets: 0,
    pendingTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    clients: 0,
    prospects: 0
  });
  const [ticketEvolutionData, setTicketEvolutionData] = useState([]);
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
      // Fetch all necessary data in parallel
      const [prospectsRes, clientsRes, usersRes, ticketsRes] = await Promise.all([
        axios.get(`${API_URL}/prospects`),
        axios.get(`${API_URL}/clients`),
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/tickets`)
      ]);
      
      // Process ticket statistics
      const tickets = ticketsRes.data;
      const pendingTickets = tickets.filter(ticket => ticket.status === 'pending').length;
      const inProgressTickets = tickets.filter(ticket => ticket.status === 'in-progress').length;
      const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved').length;
      const openTickets = pendingTickets + inProgressTickets;
      
      // Update all stats
      setStats({
        prospects: prospectsRes.data.length,
        clients: clientsRes.data.length,
        users: usersRes.data.length,
        tickets: tickets.length,
        openTickets,
        pendingTickets,
        inProgressTickets,
        resolvedTickets
      });
      
      // Process ticket evolution data
      generateTicketEvolutionData(tickets);
      
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate ticket evolution data based on ticket creation dates
  const generateTicketEvolutionData = (tickets) => {
    const now = new Date();
    const tenDaysAgo = new Date(now);
    tenDaysAgo.setDate(now.getDate() - 9); // 10 days including today
    
    // Create an array for the last 10 days
    const days = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(tenDaysAgo);
      date.setDate(tenDaysAgo.getDate() + i);
      
      days.push({
        date: new Date(date),
        formattedDate: date.toISOString().split('T')[0], // YYYY-MM-DD
        day: dayNames[date.getDay()],
        tickets: 0
      });
    }
    
    // Count tickets created on each day
    tickets.forEach(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      const formattedTicketDate = ticketDate.toISOString().split('T')[0];
      
      const dayEntry = days.find(day => day.formattedDate === formattedTicketDate);
      if (dayEntry) {
        dayEntry.tickets++;
      }
    });
    
    // Format for the chart
    const chartData = days.map(day => ({
      day: `${day.day} ${day.date.getDate()}/${day.date.getMonth() + 1}`,
      tickets: day.tickets
    }));
    
    setTicketEvolutionData(chartData);
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

  const handleTicketUpdated = () => {
    fetchStats();
  };

  const renderDashboard = () => {
    return (
      <div className="dashboard-content">
        <h2>Dashboard Overview</h2>
        {loading ? (
          <div className="loading">Chargement des statistiques...</div>
        ) : (
          <>
            <div className="stats-container">
              <div className="stat-card">
                <h3>Users</h3>
                <p className="stat-value">{stats.users}</p>
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
            
            {/* Ticket Statistics Cards */}
            <div className="ticket-stats-container">
              <div className="ticket-stat-card">
                <h3>Total Tickets</h3>
                <p className="ticket-stat-value">{stats.tickets}</p>
              </div>
              <div className="ticket-stat-card pending">
                <h3>En attente</h3>
                <p className="ticket-stat-value">{stats.pendingTickets}</p>
              </div>
              <div className="ticket-stat-card in-progress">
                <h3>En cours</h3>
                <p className="ticket-stat-value">{stats.inProgressTickets}</p>
              </div>
              <div className="ticket-stat-card resolved">
                <h3>Résolus</h3>
                <p className="ticket-stat-value">{stats.resolvedTickets}</p>
              </div>
            </div>
            
            {/* Ticket Evolution Graph */}
            <div className="ticket-evolution-card">
              <h3>Évolution des tickets</h3>
              <div className="ticket-evolution-graph">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={ticketEvolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="tickets" 
                      stroke="#3498db" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();

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
            <TicketList onTicketUpdated={handleTicketUpdated} />
          </div>
        );
      
      case 'createTicket':
        return (
          <div>
            <h2>Create Ticket</h2>
            <CreateTicketForm onTicketCreated={handleTicketUpdated} />
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
              onClick={() => {
                setActiveSection('tickets');
                fetchStats(); // Refresh stats when visiting tickets page
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