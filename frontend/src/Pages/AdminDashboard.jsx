// Pages/AdminDashboard.jsx
import React, { useState } from 'react';
import '../styles/AdminDashboard.css';
const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  // Dashboard statistics
  const stats = {
    users: 42,
    tickets: 156,
    openTickets: 23,
    clients: 38,
    prospects: 15
  };

  const renderSection = () => {
    switch(activeSection) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <h2>Dashboard Overview</h2>
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
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <p>No recent activities to display.</p>
            </div>
          </div>
        );
      case 'users':
        return <div><h2>User Data</h2><p>User list will be implemented here.</p></div>;
      case 'createUser':
        return <div><h2>Create User</h2><p>User creation form will be implemented here.</p></div>;
      case 'tickets':
        return <div><h2>Tickets</h2><p>Ticket list will be implemented here.</p></div>;
      case 'createTicket':
        return <div><h2>Create Ticket</h2><p>Ticket creation form will be implemented here.</p></div>;
      case 'clients':
        return <div><h2>Fiches Clients</h2><p>Client list will be implemented here.</p></div>;
      case 'prospects':
        return <div><h2>Prospects</h2><p>Prospect list will be implemented here.</p></div>;
      case 'documents':
        return <div><h2>Documents</h2><p>Document management will be implemented here.</p></div>;
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
              Create User
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
            <li className="sidebar-section">Affaires</li>
            <li 
              className={activeSection === 'clients' ? 'active' : ''}
              onClick={() => setActiveSection('clients')}
            >
              Fiches Clients
            </li>
            <li 
              className={activeSection === 'prospects' ? 'active' : ''}
              onClick={() => setActiveSection('prospects')}
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