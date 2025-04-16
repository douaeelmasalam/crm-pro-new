import React, { useState, useEffect } from 'react';
import '../styles/Demands.css';

const AgentDemands = () => {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    // Fetch demands from API
    const fetchDemands = async () => {
      try {
        // This would be an actual API call in production
        // const response = await fetch('/api/agent/demands');
        // const data = await response.json();
        
        // Placeholder data
        const mockDemands = [
          { id: 'DM-405', title: 'Feature request: Export to PDF', client: 'Acme Corp', status: 'pending', priority: 'medium', date: '2025-04-15' },
          { id: 'DM-404', title: 'API integration assistance', client: 'TechGlobal', status: 'in_review', priority: 'high', date: '2025-04-14' },
          { id: 'DM-403', title: 'Custom report template', client: 'Stellar Inc', status: 'approved', priority: 'medium', date: '2025-04-13' },
          { id: 'DM-402', title: 'User permissions adjustment', client: 'Phoenix Ltd', status: 'pending', priority: 'low', date: '2025-04-12' },
          { id: 'DM-401', title: 'Data migration service', client: 'Globe Enterprises', status: 'in_progress', priority: 'high', date: '2025-04-11' },
        ];
        
        setDemands(mockDemands);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching demands:', error);
        setLoading(false);
      }
    };
    
    fetchDemands();
  }, []);
  
  const filteredDemands = filter === 'all' 
    ? demands 
    : demands.filter(demand => demand.status === filter);
  
  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending':
        return 'Pending';
      case 'in_review':
        return 'In Review';
      case 'approved':
        return 'Approved';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };
  
  const getStatusClass = (status) => {
    switch(status) {
      case 'pending':
        return 'status-pending';
      case 'in_review':
        return 'status-review';
      case 'approved':
        return 'status-approved';
      case 'in_progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
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
    <div className="demands-container">
      <div className="demands-header">
        <h1>Client Demands</h1>
        <div className="demands-actions">
          <div className="filter-controls">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Demands</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <a href="/agent/demands/create" className="create-button">New Demand</a>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading demands...</div>
      ) : (
        <div className="demands-list">
          <table className="demands-table">
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
              {filteredDemands.length > 0 ? (
                filteredDemands.map(demand => (
                  <tr key={demand.id}>
                    <td>{demand.id}</td>
                    <td>{demand.title}</td>
                    <td>{demand.client}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(demand.status)}`}>
                        {getStatusLabel(demand.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityClass(demand.priority)}`}>
                        {demand.priority.charAt(0).toUpperCase() + demand.priority.slice(1)}
                      </span>
                    </td>
                    <td>{demand.date}</td>
                    <td>
                      <div className="demand-actions">
                        <button className="action-btn view-btn">View</button>
                        <button className="action-btn edit-btn">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-demands">No demands found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgentDemands;