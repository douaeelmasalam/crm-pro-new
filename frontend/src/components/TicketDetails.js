import React, { useState, useEffect } from 'react';
import '../styles/TicketList.css';
import axios from 'axios';
 import { toast } from 'react-toastify';

const TicketDetails = ({ ticket, onClose, onDelete, onSave, availableUsers }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...ticket });
  const [expandedSubticketId, setExpandedSubticketId] = useState(null);
  const [viewExpandedSubticketId, setViewExpandedSubticketId] = useState(null);
  const [subtickets, setSubtickets] = useState([]);
  
  const [newSubticket, setNewSubticket] = useState({
  title: '',
  description: '',
  priority: 'faible',
  clientConcerned: '',
  assignedUsers: [],
  status: 'ouvert',
  dueDate: '',
  reminderDate: '',
  reminderType: 'email',
  ticketType: ''
});
  axios.defaults.baseURL = 'http://localhost:5000/api';

  // Options pour les différents sélecteurs
  const priorityOptions = ['faible', 'moyenne', 'élevée', 'critique'];
  const statusOptions = ['ouvert', 'en cours', 'résolu', 'fermé'];
  const ticketSourceOptions = ['email', 'telephone', 'chat', 'formulaire'];
  const reminderTypeOptions = ['email', 'telephone'];
  const ticketTypeOptions = ['bug', 'feature', 'support', 'question', 'autre'];

  useEffect(() => {
    setEditFormData({ ...ticket });
  }, [ticket]);

useEffect(() => {
  if (ticket?._id) {
    fetchSubtickets(ticket._id);
  }
}, [ticket]);


useEffect(() => {
  setEditFormData(prev => ({
    ...prev,
    subtickets: [...subtickets]
  }));
}, [subtickets]);



  const fetchSubtickets = async (ticketId) => {
    try {
      const { data } = await axios.get(`/subtickets/ticket/${ticketId}`);
      setSubtickets(data);
    } catch (err) {
      console.error('Erreur récupération sous-tickets', err);
    }
  };
  
const toggleViewSubticketExpansion = (subticketId) => {
  setViewExpandedSubticketId(viewExpandedSubticketId === subticketId ? null : subticketId);
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSelection = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, opt => opt.value);
    const selectedUsers = availableUsers.filter(user => selectedIds.includes(user._id));
    setEditFormData(prev => ({ ...prev, assignedUsers: selectedUsers }));
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Sauvegarder d'abord le ticket principal
  const success = await onSave({
    ...editFormData,
    subtickets: undefined // Ne pas envoyer les sous-tickets avec le ticket principal
  });
  
  if (!success) return;

  // Mettre à jour les sous-tickets un par un
  for (const subticket of subtickets) {
    try {
        const completeSubticket = {
        ...subticket,
        ticketId: ticket._id,
        // Si certains champs sont undefined, les initialiser
        title: subticket.title || '',
        description: subticket.description || '',
        priority: subticket.priority || 'faible',
        status: subticket.status || 'ouvert',
        clientConcerned: subticket.clientConcerned || '',
        assignedUsers: subticket.assignedUsers || [],
        ticketType: subticket.ticketType || '',
        dueDate: subticket.dueDate || '',
        reminderDate: subticket.reminderDate || '',
        reminderType: subticket.reminderType || 'email'
      };

      if (subticket._id) {
       await axios.put(`/subtickets/${subticket._id}`, completeSubticket);
      } else {
        // Nouveau sous-ticket, création
        const newSubticket = {
          ...subticket,
          ticketId: ticket._id
        };
        await axios.post('/subtickets', newSubticket);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du sous-ticket', error);
      toast.error(`Erreur: ${subticket.title || 'sous-ticket'}`);
    }
  }
  
  
    if (ticket?._id) {
    fetchSubtickets(ticket._id);
  }
  
  setIsEditing(false);
};

  const handleSubticketUserAssignment = (subticketId, selectedUserIds) => {
  const selectedUsers = availableUsers.filter(user => 
    selectedUserIds.includes(user._id)
  );
  
  handleSubticketChange(subticketId, 'assignedUsers', selectedUsers);
};



  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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

  const getUserName = (user) => {
    if (!user) return '';
    if (typeof user === 'object') {
      return user.name || user.username || 'User';
    }
    return 'User';
  };



const handleSubticketChange = (subticketId, field, value) => {
  // Mettre à jour directement l'état des sous-tickets
  setSubtickets(prevSubtickets => 
    prevSubtickets.map(st =>
      st._id === subticketId ? { ...st, [field]: value } : st
    )
  );
};

  const handleRemoveSubticket = async (subticketId) => {
    setEditFormData(prev => ({
      ...prev,
      subtickets: prev.subtickets?.filter(st => st._id !== subticketId && st.id !== subticketId)
    }));

    if (expandedSubticketId === subticketId) setExpandedSubticketId(null);

    try {
      await axios.delete(`/subtickets/${subticketId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du sous-ticket', error);
    }
  };



const addNewSubticket = async () => {
  if (!ticket?._id) {
    toast.error("Impossible d'ajouter un sous-ticket sans ticket parent.");
    return;
  }

const subticketToAdd = {
  ticketId: ticket._id,
  title: 'Nouveau sous-ticket', // Un titre par défaut
  description: '',
  priority: 'faible',
  status: 'ouvert',
  clientConcerned: ticket.clientConcerned || '', // Copier depuis le ticket parent
  assignedUsers: [],
  dueDate: '',
  reminderDate: '',
  reminderType: 'email',
  ticketType: ticket.ticketType || '',
  // S'assurer que tous les champs sont présents
  createdAt: new Date().toISOString()
};

  try {
    const response = await axios.post('/subtickets', subticketToAdd);

    if (response.status === 201 || response.status === 200) {
      const createdSubticket = response.data;
      
      // Mettre à jour directement les deux états
      setSubtickets(prev => [...prev, createdSubticket]);
      
      setExpandedSubticketId(createdSubticket._id);
      toast.success("Sous-ticket ajouté avec succès.");
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout du sous-ticket :", error);
    toast.error("Erreur lors de la création du sous-ticket.");
  }
};

  return (
    <div className="ticket-detail-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditing ? "Edit Ticket" : "Ticket Details"}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label>Client</label>
                <input
                  type="text"
                  name="clientConcerned"
                  value={editFormData.clientConcerned || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Source du ticket</label>
                <select
                  name="ticketSource"
                  value={editFormData.ticketSource || 'email'}
                  onChange={handleChange}
                >
                  {ticketSourceOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Type de ticket</label>
                <select
                  name="ticketType"
                  value={editFormData.ticketType || ''}
                  onChange={handleChange}
                >
                  <option value="">-- Sélectionner un type --</option>
                  {ticketTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={editFormData.priority || ''}
                    onChange={handleChange}
                  >
                    <option value="faible">Low</option>
                    <option value="moyenne">Medium</option>
                    <option value="élevée">High</option>
                    <option value="critique">Critical</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={editFormData.status || ''}
                    onChange={handleChange}
                  >
                    <option value="ouvert">Open</option>
                    <option value="en cours">In Progress</option>
                    <option value="résolu">Resolved</option>
                    <option value="fermé">Closed</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={editFormData.dueDate ? new Date(editFormData.dueDate).toISOString().slice(0, 16) : ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Reminder</label>
                  <input
                    type="datetime-local"
                    name="reminderDate"
                    value={editFormData.reminderDate ? new Date(editFormData.reminderDate).toISOString().slice(0, 16) : ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Type de rappel</label>
                <select
                  name="reminderType"
                  value={editFormData.reminderType || 'email'}
                  onChange={handleChange}
                >
                  {reminderTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Assigned To</label>
                <select
                  multiple
                  value={editFormData.assignedUsers?.map(user => user._id) || []}
                  onChange={handleUserSelection}
                >
                  {availableUsers.map(user => (
                    <option key={user._id} value={user._id}>
                      {getUserName(user)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sous-tickets section */}
{/* Remplacer cette partie du code dans le formulaire d'édition */}
<div className="subtickets-section">
  <div className="subtickets-header">
    <h3>Sous-tickets</h3>
    <button 
      type="button" 
      className="add-subticket-btn plus-btn" 
      onClick={addNewSubticket}
    >
      +
    </button>
  </div>
  
  {editFormData.subtickets && editFormData.subtickets.length > 0 ? (
    <div className="subtickets-list">
      {editFormData.subtickets.map((subticket, index) => (
        <div key={subticket._id || subticket.id} className="subticket-item">
          <div className="subticket-header">
            <span className="subticket-number">{index + 1}.</span>
            <span className="subticket-title">{subticket.title}</span>
            <span className="subticket-priority">[{subticket.priority}]</span>
            <div className="subticket-actions">
              <button 
                type="button" 
                className="toggle-btn"
                onClick={() => setExpandedSubticketId(expandedSubticketId === (subticket._id || subticket.id) ? null : (subticket._id || subticket.id))}
              >
                {expandedSubticketId === (subticket._id || subticket.id) ? '▲' : '▼'}
              </button> 
              <button 
                type="button" 
                className="remove-btn"
                onClick={() => handleRemoveSubticket(subticket._id || subticket.id)}
              >
                ×
              </button>
            </div>
          </div>
          
          {expandedSubticketId === (subticket._id || subticket.id) && (
            <div className="subticket-details">
              {/* Reprendre le même format que dans CreateTicketForm */}
              <div className="form-group">
                <label>Titre:</label>
                <input 
                  type="text" 
                  value={subticket.title}
                  onChange={(e) => handleSubticketChange(subticket._id || subticket.id, 'title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea 
                  value={subticket.description}
                  onChange={(e) => handleSubticketChange(subticket._id || subticket.id, 'description', e.target.value)}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Priorité:</label>
                <select
                  value={subticket.priority}
                  onChange={(e) => handleSubticketChange(subticket._id || subticket.id, 'priority', e.target.value)}
                >
                  {priorityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              {/* Ajouter les champs additionnels comme dans CreateTicketForm */}
              <div className="form-group">
                <label>Client concerné:</label>
                <input 
                  type="text" 
                  value={subticket.clientConcerned || ''}
                  onChange={(e) => handleSubticketChange(subticket._id || subticket.id, 'clientConcerned', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Statut:</label>
                <select
                  value={subticket.status || 'ouvert'}
                  onChange={(e) => handleSubticketChange(subticket._id || subticket.id, 'status', e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Type de ticket:</label>
                <select
                  value={subticket.ticketType || ''}
                  onChange={(e) => handleSubticketChange(subticket._id || subticket.id, 'ticketType', e.target.value)}
                >
                  <option value="">-- Sélectionner un type --</option>
                  {ticketTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Échéance:</label>
                <input 
                  type="date" 
                  value={subticket.dueDate || ''}
                  onChange={(e) => handleSubticketChange(subticket._id || subticket.id, 'dueDate', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Rappel:</label>
                <input 
                  type="date" 
                  value={subticket.reminderDate || ''}
                  onChange={(e) => handleSubticketChange(subticket._id || subticket.id, 'reminderDate', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Type de rappel:</label>
                <select
                  value={subticket.reminderType || 'email'}
                  onChange={(e) => handleSubticketChange(subticket._id || subticket.id, 'reminderType', e.target.value)}
                >
                  {reminderTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              {/* Ajouter la sélection d'utilisateurs pour le sous-ticket */}
              <div className="form-group">
                <label>Assigner à:</label>
                <select
                  multiple
                  value={subticket.assignedUsers?.map(user => user._id) || []}
                  onChange={(e) => {
                    const selectedIds = Array.from(e.target.selectedOptions, opt => opt.value);
                    const selectedUsers = availableUsers.filter(user => selectedIds.includes(user._id));
                    handleSubticketChange(subticket._id || subticket.id, 'assignedUsers', selectedUsers);
                  }}
                >
                  {availableUsers.map(user => (
                    <option key={user._id} value={user._id}>
                      {getUserName(user)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <p className="no-subtickets">Aucun sous-ticket</p>
  )}
</div>              
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="ticket-details">
              <div className="detail-row">
                <div className="detail-label">Title:</div>
                <div className="detail-value">{ticket.title}</div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">Description:</div>
                <div className="detail-value">{ticket.description}</div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">Client:</div>
                <div className="detail-value">{ticket.clientConcerned}</div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">Source du ticket:</div>
                <div className="detail-value">{ticket.ticketSource || 'email'}</div>
              </div>
              
              {ticket.ticketType && (
                <div className="detail-row">
                  <div className="detail-label">Type de ticket:</div>
                  <div className="detail-value">{ticket.ticketType}</div>
                </div>
              )}
              
              <div className="detail-row">
                <div className="detail-label">Assigned To:</div>
                <div className="detail-value">
                  {ticket.assignedUsers?.length > 0 ? 
                    ticket.assignedUsers.map((user, index) => (
                      <span key={index} className="assigned-user">
                        {getUserName(user)}
                      </span>
                    )) : 
                    'Unassigned'}
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">Priority:</div>
                <div className="detail-value">
                  <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                    {ticket.priority === 'faible' ? 'Low' :
                     ticket.priority === 'moyenne' ? 'Medium' :
                     ticket.priority === 'élevée' ? 'High' :
                     ticket.priority === 'critique' ? 'Critical' : ticket.priority}
                  </span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">Status:</div>
                <div className="detail-value">
                  <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                    {ticket.status === 'ouvert' ? 'Open' :
                     ticket.status === 'en cours' ? 'In Progress' :
                     ticket.status === 'résolu' ? 'Resolved' :
                     ticket.status === 'fermé' ? 'Closed' : ticket.status}
                  </span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">Due Date:</div>
                <div className="detail-value">{formatDate(ticket.dueDate)}</div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">Reminder:</div>
                <div className="detail-value">
                  {formatDate(ticket.reminderDate)}
                  {ticket.reminderType && ` (${ticket.reminderType})`}
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">Created:</div>
                <div className="detail-value">{formatDate(ticket.createdAt)}</div>
              </div>
              
              <div className="detail-row">
                <div className="detail-label">Last Updated:</div>
                <div className="detail-value">{formatDate(ticket.updatedAt)}</div>
              </div>


     {subtickets.length > 0 && (
  <div className="detail-row subtickets-section">
    <div className="detail-label">Sous-tickets :</div>
    <div className="detail-value subtickets-list">
      {subtickets.map((sub, index) => (
        <div key={sub._id} className="subticket-item">
          <div className="subticket-header" onClick={() => toggleViewSubticketExpansion(sub._id)}>
            <span className="subticket-number">{index + 1}.</span>
            <span className="subticket-title">{sub.title}</span>
            
            <button 
              type="button" 
              className="toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleViewSubticketExpansion(sub._id);
              }}
            >
              {viewExpandedSubticketId === sub._id ? '▲' : '▼'}
            </button>
          </div>
          
          {viewExpandedSubticketId === sub._id && (
            <div className="subticket-expanded-details">
              <div className="detail-row">
                <div className="detail-label">Description:</div>
                <div className="detail-value">{sub.description}</div>
              </div>
              
              {sub.status && (
                <div className="detail-row">
                  <div className="detail-label">Statut:</div>
                  <div className="detail-value">
                    <span className={`status-badge status-${sub.status.toLowerCase()}`}>
                      {sub.status}
                    </span>
                  </div>
                </div>
              )}
              
              {sub.priority && (
                <div className="detail-row">
                  <div className="detail-label">Priorité:</div>
                  <div className="detail-value">
                    <span className={`priority-badge priority-${sub.priority.toLowerCase()}`}>
                      {sub.priority}
                    </span>
                  </div>
                </div>
              )}
              
              {sub.clientConcerned && (
                <div className="detail-row">
                  <div className="detail-label">Client:</div>
                  <div className="detail-value">{sub.clientConcerned}</div>
                </div>
              )}
              
              {sub.assignedUsers?.length > 0 && (
                <div className="detail-row">
                  <div className="detail-label">Assigned To:</div>
                  <div className="detail-value">
                    {sub.assignedUsers.map((user, idx) => (
                      <span key={idx} className="assigned-user">
                        {getUserName(user)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {sub.ticketType && (
                <div className="detail-row">
                  <div className="detail-label">Type:</div>
                  <div className="detail-value">{sub.ticketType}</div>
                </div>
              )}
              
              {sub.dueDate && (
                <div className="detail-row">
                  <div className="detail-label">Due Date:</div>
                  <div className="detail-value">{formatDate(sub.dueDate)}</div>
                </div>
              )}
              
              {sub.reminderDate && (
                <div className="detail-row">
                  <div className="detail-label">Reminder:</div>
                  <div className="detail-value">
                    {formatDate(sub.reminderDate)}
                    {sub.reminderType && ` (${sub.reminderType})`}
                  </div>
                </div>
              )}
              
              <div className="detail-row">
                <div className="detail-label">Created:</div>
                <div className="detail-value">{formatDate(sub.createdAt)}</div>
              </div>
              
              {sub.updatedAt && (
                <div className="detail-row">
                  <div className="detail-label">Last Updated:</div>
                  <div className="detail-value">{formatDate(sub.updatedAt)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}
              
              <div className="detail-actions">
                <button className="edit-button" onClick={() => setIsEditing(true)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 13.3333H14M11 2.33333C11.2652 2.06812 11.6249 1.91905 12 1.91905C12.1857 1.91905 12.3696 1.9557 12.5412 2.02691C12.7128 2.09812 12.8687 2.20243 13 2.33333C13.1313 2.46424 13.2356 2.61916 13.3068 2.78975C13.378 2.96034 13.4147 3.14325 13.4147 3.328C13.4147 3.51275 13.378 3.69566 13.3068 3.86625C13.2356 4.03684 13.1313 4.19176 13 4.32266L4.66667 12.6667L2 13.3333L2.66667 10.6667L11 2.33333Z" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit
                </button>
                
                <button className="delete-button" onClick={() => onDelete(ticket._id)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4H3.33333H14" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.3335 4V2.66667C5.3335 2.31305 5.47397 1.97391 5.72402 1.72386C5.97407 1.47381 6.31321 1.33334 6.66683 1.33334H9.3335C9.68712 1.33334 10.0263 1.47381 10.2763 1.72386C10.5264 1.97391 10.6668 2.31305 10.6668 2.66667V4M12.6668 4V13.3333C12.6668 13.687 12.5264 14.0261 12.2763 14.2761C12.0263 14.5262 11.6871 14.6667 11.3335 14.6667H4.66683C4.31321 14.6667 3.97407 14.5262 3.72402 14.2761C3.47397 14.0261 3.3335 13.687 3.3335 13.3333V4H12.6668Z" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;