import React, { useState, useEffect } from 'react';
import '../styles/Tickets.css';

const AgentTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    // Fetch tickets from API
    const fetchTickets = async () => {
      try {
        // This would be an actual API call in production
        // const response = await fetch('/api/agent/tickets');
        // const data = await response.json();
        
        // Placeholder data
        const mockTickets = [
          { id: 'TK-2023', title: 'Login issue', client: 'Acme Corp', status: 'open', priority: 'high', date: '2025-04-15' },
          { id: 'TK-2022', title: 'Data sync problem', client: 'TechGlobal', status: 'in_progress', priority: 'medium', date: '2025-04-14' },
          { id: 'TK-2021', title: 'Report generation error', client: 'Stellar Inc', status: 'resolved', priority: 'low', date: '2025-04-13' },
          { id: 'TK-2020', title: 'Account access request', client: 'Phoenix Ltd', status: 'open', priority: 'medium', date: '2025-04-12' },
          { id: 'TK-2019', title: 'Dashboard not loading', client: 'Globe Enterprises', status: 'in_progress', priority: 'high', date: '2025-04-11' },
        ];
        
        setTickets(mockTickets);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, []);
  
  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.status === filter);
  
  const getStatusLabel = (status) => {
    switch(status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };
  
  const getStatusClass = (status) => {
    switch(status) {
      case 'open':
        return 'status-open';
      case 'in_progress':
        return 'status-in-progress';
      case 'resolved':
        return 'status-resolved';
      default:
        return '';
    }
  };
  
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };
  
  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <h1>Tickets</h1>
        <div className="tickets-actions">
          <div className="filter-controls">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <a href="/agent/tickets/create" className="create-button">Create Ticket</a>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading tickets...</div>
      ) : (
        <div className="tickets-list">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Client</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length > 0 ? (
                filteredTickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td>{ticket.id}</td>
                    <td>{ticket.title}</td>
                    <td>{ticket.client}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </td>
                    <td>{ticket.date}</td>
                    <td>
                      <div className="ticket-actions">
                        <button className="action-btn view-btn">View</button>
                        <button className="action-btn edit-btn">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-tickets">No tickets found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgentTickets;