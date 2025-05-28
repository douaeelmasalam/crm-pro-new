import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketDetails from './TicketDetails';
import '../styles/TicketList.css';

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  // const [selectedUserId, setSelectedUserId] = useState(null);
const [selectedUser, setSelectedUser] = useState(null);  // will hold full user object


  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/tickets');
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError('Error loading tickets.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setAvailableUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const deleteTicket = async (id) => {
    if (!window.confirm("Confirm ticket deletion?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tickets/${id}`, { 
        method: 'DELETE' 
      });
      if (!res.ok) throw new Error('Delete error');
      setTickets(tickets.filter(ticket => ticket._id !== id));
      if (selectedTicket && selectedTicket._id === id) {
        setSelectedTicket(null);
      }
    } catch (err) {
      alert("Error deleting ticket.");
    }
  };

  const openTicketDetail = async (ticket) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${ticket._id}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const detailedTicket = await response.json();
      setSelectedTicket(detailedTicket);
    } catch (err) {
      alert("Error loading ticket details.");
    }
  };

  const saveTicketChanges = async (updatedTicket) => {
    try {
      // Format assignedUsers if necessary
      let formattedTicket = { ...updatedTicket };
      
      // Transform assignedUsers to array of IDs if needed by your API
      if (formattedTicket.assignedUsers && Array.isArray(formattedTicket.assignedUsers)) {
        const needsFormatting = formattedTicket.assignedUsers.some(user => typeof user === 'object' && user._id);
        
        if (needsFormatting) {
          formattedTicket.assignedUsers = formattedTicket.assignedUsers.map(user => 
            typeof user === 'object' && user._id ? user._id : user
          );
        }
      }
      
      console.log('Sending update to backend:', formattedTicket);
      
      // Envoyer la mise à jour au backend
      const response = await fetch(`http://localhost:5000/api/tickets/${formattedTicket._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedTicket)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update ticket');
      }
      
      // Récupérer le ticket mis à jour depuis la réponse
      const updatedData = await response.json();
      console.log('Update successful, received data:', updatedData);
      
      // Mettre à jour l'état local avec les données du serveur
      setTickets(tickets.map(ticket => 
        ticket._id === updatedData._id ? updatedData : ticket
      ));
      
      // Mettre à jour le ticket sélectionné
      setSelectedTicket(updatedData);
      
      return true; // Indiquer le succès
    } catch (err) {
      console.error('Save error:', err);
      alert(`Failed to save ticket: ${err.message}`);
      return false; // Indiquer l'échec
    }
  };

const filteredTickets = tickets.filter(ticket => {
  const matchesSearch = (
    ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.clientConcerned?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticketType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Selected user:", selectedUser);
  console.log("Assigned users for this ticket:", 
    ticket.assignedUsers.map(user => `${user.name} (ID: ${user.id || user._id})`).join(", ")
  );

  const matchesStatus = filter === 'all' || ticket.status === filter;

  // Here: check if selectedUser's name exists in ticket.assignedUsers
  const matchesUser = !selectedUser || ticket.assignedUsers.some(user => user.name === selectedUser.name);

  return matchesSearch && matchesStatus && matchesUser;
});







  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="error-container">{error}</div>;

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-header">
        <h1>Tickets</h1>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/admin/dashboard', { state: { activeSection: 'createTicket' } })}
            className="create-ticket-btn"
          >
            + Create Ticket
          </button>
          
          <div className="search-container">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 14L10 10M11.3333 6.66667C11.3333 9.244 9.244 11.3333 6.66667 11.3333C4.08934 11.3333 2 4.08934 2 6.66667C2 4.08934 4.08934 2 6.66667 2C9.244 2 11.3333 4.08934 11.3333 6.66667Z" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="ouvert">Open</option>
            <option value="en cours">In Progress</option>
            <option value="résolu">Resolved</option>
            <option value="fermé">Closed</option>
          </select>
          
          <button onClick={fetchTickets} className="refresh-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 8C13.5 9.05058 13.1725 10.0909 12.5538 10.9749C11.9352 11.8589 11.0525 12.5436 10.0241 12.9294C8.99566 13.3152 7.87099 13.3831 6.80315 13.1237C5.73531 12.8643 4.77598 12.2903 4.05025 11.4785M2.5 8C2.5 6.94942 2.82749 5.90914 3.44615 5.02513C4.06481 4.14112 4.94753 3.45639 5.97595 3.07061C7.00438 2.68482 8.12904 2.61688 9.19688 2.87629C10.2647 3.1357 11.224 3.70974 11.9497 4.52153M13.5 3V6.5H10M2.5 13V9.5H6" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>
      <div className="user-filter-container">
        <span className="filter-label">Filter by User:</span>
<div className="user-bubbles">
  {availableUsers.map(user => (
    <div
      key={user._id}
      className={`user-bubble ${selectedUser?._id === user._id ? 'selected' : ''}`}
      onClick={() => {
        // Toggle selection: deselect if clicked again
        setSelectedUser(prev => (prev?._id === user._id ? null : user));
        console.log(`Selected user ID: ${user._id}, name: ${user.name}`);
      }}
      title={user.name}
      style={{ cursor: 'pointer' }}
    >
      {user.name}
    </div>
  ))}
</div>

      </div>

      <div className="table-wrapper">
        <table className="ticket-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('title')}>Title</th>
              <th onClick={() => requestSort('description')}>Description</th>
              <th onClick={() => requestSort('clientConcerned')}>Client</th>
              <th onClick={() => requestSort('ticketType')}>Type</th>
              <th onClick={() => requestSort('assignedUsers')}>Assigned To</th>
              <th onClick={() => requestSort('priority')}>Priority</th>
              <th onClick={() => requestSort('status')}>Status</th>
              <th onClick={() => requestSort('dueDate')}>Due Date</th>
              <th onClick={() => requestSort('createdAt')}>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTickets.length === 0 ? (
              <tr className="no-tickets-row">
                <td colSpan="10">No tickets found</td>
              </tr>
            ) : (
              sortedTickets.map((ticket) => (
                <TicketRow 
                  key={ticket._id}
                  ticket={ticket}
                  onView={() => openTicketDetail(ticket)}
                  onDelete={() => deleteTicket(ticket._id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedTicket && (
        <TicketDetails 
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onDelete={deleteTicket}
          onSave={saveTicketChanges}
          availableUsers={availableUsers}
        />
      )}
    </div>
  );
}

const TicketRow = ({ ticket, onView, onDelete }) => {
  const getUserName = (user) => {
    if (!user) return '';
    if (typeof user === 'object') {
      return user.name || user.username || 'User';
    }
    return 'User';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ouvert': return 'status-open';
      case 'en cours': return 'status-in-progress';
      case 'résolu': return 'status-resolved';
      case 'fermé': return 'status-closed';
      default: return '';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'faible': return 'priority-low';
      case 'moyenne': return 'priority-medium';
      case 'élevée': return 'priority-high';
      case 'critique': return 'priority-critical';
      default: return '';
    }
  };

  const getTicketTypeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'bug': return 'type-bug';
      case 'feature': return 'type-feature';
      case 'question': return 'type-question';
      case 'support': return 'type-support';
      case 'maintenance': return 'type-maintenance';
      default: return 'type-other';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <tr className="ticket-row">
      <td>
        <div className="ticket-title" onClick={onView}>
          <div className="ticket-icon">{ticket.title?.charAt(0)?.toUpperCase()}</div>
          <span>{ticket.title}</span>
        </div>
      </td>
      <td className="ticket-description">
        {ticket.description?.substring(0, 50)}{ticket.description?.length > 50 ? '...' : ''}
      </td>
      <td>{ticket.clientConcerned}</td>
      <td>
        <span className={`type-badge ${getTicketTypeClass(ticket.ticketType)}`}>
          {ticket.ticketType || 'N/A'}
        </span>
      </td>
      {/* <td>
        {ticket.assignedUsers?.length > 0 ? 
          ticket.assignedUsers.map((user, index) => (
            <span key={index} className="assigned-user">
              {getUserName(user)}
            </span>
          )) : 
          'Unassigned'}
      </td> */}
      <td>
  {ticket.assignedUsers?.length > 0 ? 
    ticket.assignedUsers.map((user, index) => (
      <span key={index} className="assigned-user">
        {getUserName(user)}
      </span>
    )) : 
    'Unassigned'}
</td>

      <td>
        <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
          {ticket.priority === 'faible' ? 'Low' :
           ticket.priority === 'moyenne' ? 'Medium' :
           ticket.priority === 'élevée' ? 'High' :
           ticket.priority === 'critique' ? 'Critical' : ticket.priority}
        </span>
      </td>
      <td>
        <span className={`status-badge ${getStatusClass(ticket.status)}`}>
          {ticket.status === 'ouvert' ? 'Open' :
           ticket.status === 'en cours' ? 'In Progress' :
           ticket.status === 'résolu' ? 'Resolved' :
           ticket.status === 'fermé' ? 'Closed' : ticket.status}
        </span>
      </td>
      <td>{formatDate(ticket.dueDate)}</td>
      <td>{formatDate(ticket.createdAt)}</td>
      <td>
        <div className="action-buttons">
          <button className="view-button" onClick={onView} title="View">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12Z" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 8V8.01" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 8C13.5 11 10.5 13 8 13C5.5 13 2.5 11 1 8C2.5 5 5.5 3 8 3C10.5 3 13.5 5 15 8Z" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="delete-button" onClick={onDelete} title="Delete">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4H3.33333H14" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.3335 4V2.66667C5.3335 2.31305 5.47397 1.97391 5.72402 1.72386C5.97407 1.47381 6.31321 1.33334 6.66683 1.33334H9.3335C9.68712 1.33334 10.0263 1.47381 10.2763 1.72386C10.5264 1.97391 10.6668 2.31305 10.6668 2.66667V4M12.6668 4V13.3333C12.6668 13.687 12.5264 14.0261 12.2763 14.2761C12.0263 14.5262 11.6871 14.6667 11.3335 14.6667H4.66683C4.31321 14.6667 3.97407 14.5262 3.72402 14.2761C3.47397 14.0261 3.3335 13.687 3.3335 13.3333V4H12.6668Z" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TicketList;