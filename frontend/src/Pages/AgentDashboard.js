// Pages/AgentDashboard.jsx
import React, { useState } from 'react';
import '../styles/AgentDashboard.css';


const AgentDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Dashboard statistics
  const stats = {
    tickets: 45,
    openTickets: 12,
    tasks: 28,
    pendingTasks: 8,
    resolutionRate: '33%',
    responseTime: '2.4h'
  };

  // Performance metrics
  const performance = {
    ticketsResolved: 15,
    avgResolutionTime: '4.2h',
    clientSatisfaction: '4.8/5'
  };

  // Recent activities
  const activities = [
    { id: 1, type: 'ticket', action: 'Resolved ticket TK-2023', date: '16/04/2025 10:30:00' },
    { id: 2, type: 'demand', action: 'Created demand DM-405', date: '16/04/2025 09:15:00' },
    { id: 3, type: 'task', action: 'Updated task TA-187', date: '15/04/2025 16:45:00' }
  ];

  // Function to handle logout
  const handleLogout = () => {
    // Normally this would include API calls to logout on the server
    console.log("Logging out...");
    
    // Clear any auth tokens from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Update state to trigger UI change or redirect
    setIsLoggedIn(false);
    
    // In a real application, you might redirect to login page
    // window.location.href = '/login';
    alert("Vous avez été déconnecté avec succès");
  };

  const renderSection = () => {
    switch(activeSection) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <h2>Tableau de Bord</h2>
            <div className="stats-container">
              <div className="stat-card">
                <h3>Tickets</h3>
                <p className="stat-value">{stats.tickets}</p>
                <p className="stat-sub">{stats.openTickets} open</p>
              </div>
              <div className="stat-card">
                <h3>Tasks</h3>
                <p className="stat-value">{stats.tasks}</p>
                <p className="stat-sub">{stats.pendingTasks} pending</p>
              </div>
              <div className="stat-card">
                <h3>Resolution Rate</h3>
                <p className="stat-value">{stats.resolutionRate}</p>
              </div>
              <div className="stat-card">
                <h3>Average Response Time</h3>
                <p className="stat-value">{stats.responseTime}</p>
              </div>
            </div>
            
            <div className="dashboard-grid">
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                {activities.length > 0 ? (
                  <ul className="activity-list">
                    {activities.map((activity) => (
                      <li key={activity.id} className="activity-item">
                        <div className="activity-icon">
                          {activity.type === 'ticket' && <span className="icon ticket-icon">🎫</span>}
                          {activity.type === 'demand' && <span className="icon demand-icon">📋</span>}
                          {activity.type === 'task' && <span className="icon task-icon">✓</span>}
                        </div>
                        <div className="activity-details">
                          <p className="activity-action">{activity.action}</p>
                          <p className="activity-date">{activity.date}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No recent activities to display.</p>
                )}
              </div>
              
              <div className="performance-summary">
                <h3>Performance Summary</h3>
                <div className="performance-grid">
                  <div className="performance-item">
                    <p className="perf-label">Tickets Resolved</p>
                    <p className="perf-value">{performance.ticketsResolved}</p>
                  </div>
                  <div className="performance-item">
                    <p className="perf-label">Average Resolution Time</p>
                    <p className="perf-value">{performance.avgResolutionTime}</p>
                  </div>
                  <div className="performance-item">
                    <p className="perf-label">Client Satisfaction</p>
                    <p className="perf-value">{performance.clientSatisfaction}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="action-buttons">
              <button className="action-btn create-ticket">Create Ticket</button>
              <button className="action-btn new-demand">New Demand</button>
              <button className="action-btn add-task">Add Task</button>
            </div>
          </div>
        );
      case 'tickets':
        return <div><h2>Tickets Clients</h2><p>La liste des tickets clients sera affichée ici.</p></div>;
      case 'demands':
        return <div><h2>Demandes des Clients</h2><p>La liste des demandes clients sera affichée ici.</p></div>;
      case 'tasks':
        return <div><h2>Tâches Administratives</h2><p>Vos tâches administratives seront affichées ici.</p></div>;
      case 'profile':
        return <div><h2>Profile</h2><p>Vos informations personnelles et paramètres seront affichés ici.</p></div>;
      default:
        return <div>Sélectionnez une section</div>;
    }
  };

  // If user is not logged in, could redirect to login page
  if (!isLoggedIn) {
    return (
      <div className="logout-redirect">
        <h2>Vous avez été déconnecté</h2>
        <p>Redirection vers la page de connexion...</p>
        <button 
          onClick={() => setIsLoggedIn(true)}
          className="login-btn"
        >
          Retourner à la page de connexion
        </button>
      </div>
    );
  }
  

  return (
    <div className="agent-container">
      <div className="agent-sidebar">
        <div className="sidebar-header">
          <h1>CRM-PRO</h1>
          <p>Agent Portal</p>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li 
              className={activeSection === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveSection('dashboard')}
            >
               Tableau de Bord
            </li>
            <li 
              className={activeSection === 'tickets' ? 'active' : ''}
              onClick={() => setActiveSection('tickets')}
            >
               Tickets Clients
            </li>
            <li 
              className={activeSection === 'demands' ? 'active' : ''}
              onClick={() => setActiveSection('demands')}
            >
               Demandes des Clients
            </li>
            <li 
              className={activeSection === 'tasks' ? 'active' : ''}
              onClick={() => setActiveSection('tasks')}
            >
               Tâches Administratives
            </li>
            <li 
              className={activeSection === 'profile' ? 'active' : ''}
              onClick={() => setActiveSection('profile')}
            >
               Profile
            </li>
          </ul>
        </nav>
      </div>
      <div className="agent-content">
        <header className="agent-header">
          <h2>Agent Dashboard</h2>
          <div className="user-info">
            <span>Agent User</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <main className="content-area">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;