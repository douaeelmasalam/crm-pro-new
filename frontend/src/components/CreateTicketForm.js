import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import '../styles/CreateTicketForm.css';

function CreateTicketForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('faible');
  const [clientConcerned, setClientConcerned] = useState(null); // Changed to object for Select
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [status, setStatus] = useState('ouvert');
  const [dueDate, setDueDate] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderType, setReminderType] = useState('email');
  const [ticketSource, setTicketSource] = useState('email');
  const [ticketType, setTicketType] = useState('');
  const [userOptions, setUserOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]); // New state for clients
  const [feedback, setFeedback] = useState(null);

  const [subtickets, setSubtickets] = useState([]);
  const [isAddSubticketModalOpen, setIsAddSubticketModalOpen] = useState(false);
  const [editingSubticketId, setEditingSubticketId] = useState(null);
  const [newSubticket, setNewSubticket] = useState({
    title: '',
    description: '',
    priority: 'faible',
    clientConcerned: null, // Changed to object for Select
    assignedUsers: [],
    status: 'ouvert',
    dueDate: '',
    reminderDate: '',
    reminderType: 'email',
    ticketType: ''
  });
  const [expandedSubticketId, setExpandedSubticketId] = useState(null);

  const priorityOptions = ['faible', 'moyenne', 'élevée', 'critique'];
  const statusOptions = ['ouvert', 'en cours', 'résolu', 'fermé'];
  const ticketSourceOptions = ['email', 'telephone', 'chat', 'formulaire'];
  const reminderTypeOptions = ['email', 'telephone'];
  const ticketTypeOptions = ['bug', 'feature', 'support', 'question', 'autre'];

  useEffect(() => {
    // Fetch users
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(user => ({
          value: user._id || user.id,
          label: user.username || user.name
        }));
        setUserOptions(formatted);
      })
      .catch(err => console.error('Erreur lors du chargement des utilisateurs:', err));

   fetch('http://localhost:5000/api/clients')
    .then(res => res.json())
    .then(data => {
      const formatted = data.map(client => ({
        value: client._id,
        label: client.nom || `Client ${client._id.slice(-4)}`
      }));
      setClientOptions(formatted);
    })
    .catch(err => console.error('Erreur lors du chargement des clients:', err));
}, []);

  const openAddSubticketModal = () => {
    setEditingSubticketId(null);
    setNewSubticket({
      title: '',
      description: '',
      priority: 'faible',
      clientConcerned: null,
      assignedUsers: [],
      status: 'ouvert',
      dueDate: '',
      reminderDate: '',
      reminderType: 'email',
      ticketType: ''
    });
    setIsAddSubticketModalOpen(true);
  };

  const openEditSubticketModal = (subticket) => {
    setEditingSubticketId(subticket.id);
    setNewSubticket({
      title: subticket.title,
      description: subticket.description,
      priority: subticket.priority,
      clientConcerned: subticket.clientConcerned || null,
      assignedUsers: subticket.assignedUsers || [],
      status: subticket.status || 'ouvert',
      dueDate: subticket.dueDate || '',
      reminderDate: subticket.reminderDate || '',
      reminderType: subticket.reminderType || 'email',
      ticketType: subticket.ticketType || ''
    });
    setIsAddSubticketModalOpen(true);
  };

  const handleSaveSubticket = () => {
    if (newSubticket.title.trim() && newSubticket.description.trim()) {
      if (editingSubticketId) {
        // Mode édition
        setSubtickets(subtickets.map(st => 
          st.id === editingSubticketId ? { ...newSubticket, id: editingSubticketId } : st
        ));
      } else {
        // Mode ajout
        setSubtickets([...subtickets, {
          ...newSubticket,
          id: Date.now()
        }]);
      }

      // Réinitialiser le formulaire
      setNewSubticket({
        title: '',
        description: '',
        priority: 'faible',
        clientConcerned: null,
        assignedUsers: [],
        status: 'ouvert',
        dueDate: '',
        reminderDate: '',
        reminderType: 'email',
        ticketType: ''
      });
      setEditingSubticketId(null);
      setIsAddSubticketModalOpen(false);
    }
  };

  const handleRemoveSubticket = (subticketId) => {
    setSubtickets(subtickets.filter(st => st.id !== subticketId));
    if (expandedSubticketId === subticketId) {
      setExpandedSubticketId(null);
    }
  };

  const toggleSubticketExpansion = (subticketId) => {
    setExpandedSubticketId(expandedSubticketId === subticketId ? null : subticketId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // First, create the main ticket
      const ticketResponse = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          clientConcerned: clientConcerned?.value || null, // Extract client ID
          assignedUsers: assignedUsers.map(u => u.value),
          status,
          dueDate,
          reminderDate,
          reminderType,
          ticketSource,
          ticketType,
        }),
      });

      if (ticketResponse.ok) {
        const ticketData = await ticketResponse.json();
        const ticketId = ticketData.ticket._id;
        
        // If there are subtickets, create them in a separate request
        if (subtickets.length > 0) {
          const subticketResponse = await fetch('http://localhost:5000/api/subtickets/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subtickets: subtickets.map(subticket => ({
                title: subticket.title,
                description: subticket.description,
                priority: subticket.priority,
                clientConcerned: subticket.clientConcerned?.value || null, // Extract client ID
                assignedUsers: subticket.assignedUsers?.map(u => u.value) || [],
                status: subticket.status,
                dueDate: subticket.dueDate,
                reminderDate: subticket.reminderDate,
                reminderType: subticket.reminderType,
                ticketType: subticket.ticketType
              })),
              ticketId: ticketId
            }),
          });
          
          if (subticketResponse.ok) {
            setFeedback({ type: 'success', message: 'Ticket et sous-tickets créés avec succès' });
          } else {
            const errorData = await subticketResponse.json();
            setFeedback({ 
              type: 'warning', 
              message: `Ticket créé, mais erreur lors de la création des sous-tickets: ${errorData.message}` 
            });
          }
        } else {
          setFeedback({ type: 'success', message: 'Ticket créé avec succès' });
        }

        // Réinitialiser le formulaire
        setTitle('');
        setDescription('');
        setPriority('faible');
        setClientConcerned(null);
        setAssignedUsers([]);
        setStatus('ouvert');
        setDueDate('');
        setReminderDate('');
        setReminderType('email');
        setTicketSource('email');
        setTicketType('');
        setSubtickets([]);
      } else {
        const errorData = await ticketResponse.json();
        setFeedback({ type: 'error', message: errorData.message || 'Erreur lors de la création du ticket.' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erreur réseau. Veuillez réessayer.' });
    }
  }; 

  return (
    <div className="create-ticket-form">
      <h2>Créer un nouveau ticket</h2>
      {feedback && <div className={`feedback ${feedback.type}`}>{feedback.message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Titre *</label>
          <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows="5" />
        </div>

        <div className="form-group">
          <label htmlFor="ticketSource">Source du ticket</label>
          <select 
            id="ticketSource" 
            value={ticketSource} 
            onChange={e => setTicketSource(e.target.value)}
          >
            {ticketSourceOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="ticketType">Type de ticket (optionnel)</label>
          <select 
            id="ticketType" 
            value={ticketType} 
            onChange={e => setTicketType(e.target.value)}
          >
            <option value="">-- Sélectionner un type --</option>
            {ticketTypeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Priorité</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Client concerné</label>
          <Select
            options={clientOptions}
            value={clientConcerned}
            onChange={setClientConcerned}
            placeholder="Sélectionner un client..."
            isClearable
          />
        </div>

        <div className="form-group">
          <label>Assigner à</label>
          <Select
            options={userOptions}
            isMulti
            value={assignedUsers}
            onChange={setAssignedUsers}
          />
        </div>

        <div className="form-group">
          <label>Statut</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Échéance</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group reminder-group">
            <label>Rappel</label>
            <input type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} />
          </div>
          
          <div className="form-group reminder-type-group">
            <label htmlFor="reminderType">Type de rappel</label>
            <select 
              id="reminderType" 
              value={reminderType} 
              onChange={e => setReminderType(e.target.value)}
            >
              {reminderTypeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="subtickets-section">
          <h3>Sous-tickets</h3>
          <button type="button" className="add-subticket-btn plus-btn" onClick={openAddSubticketModal}>
            +
          </button>
          
          {subtickets.length > 0 && (
            <div className="subtickets-list">
              {subtickets.map((subticket, index) => (
                <div key={subticket.id} className="subticket-item">
                  <div className="subticket-header">
                    <span className="subticket-number">{index + 1}.</span>
                    <span className="subticket-title">{subticket.title}</span>
                    <span className="subticket-priority">[{subticket.priority}]</span>
                    <div className="subticket-actions">
                      <button 
                        type="button" 
                        className="toggle-btn"
                        onClick={() => toggleSubticketExpansion(subticket.id)}
                      >
                        {expandedSubticketId === subticket.id ? '▲' : '▼'}
                      </button>
                      <button 
                        type="button" 
                        className="remove-btn"
                        onClick={() => handleRemoveSubticket(subticket.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  {expandedSubticketId === subticket.id && (
                    <div className="subticket-details">
                      <div className="form-group">
                        <label htmlFor={`edit-title-${subticket.id}`}>Titre:</label>
                        <input 
                          type="text" 
                          id={`edit-title-${subticket.id}`}
                          value={subticket.title}
                          onChange={(e) => {
                            const updatedTitle = e.target.value;
                            setSubtickets(subtickets.map(st => 
                              st.id === subticket.id ? { ...st, title: updatedTitle } : st
                            ));
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`edit-description-${subticket.id}`}>Description:</label>
                        <textarea 
                          id={`edit-description-${subticket.id}`}
                          value={subticket.description}
                          onChange={(e) => {
                            const updatedDescription = e.target.value;
                            setSubtickets(subtickets.map(st => 
                              st.id === subticket.id ? { ...st, description: updatedDescription } : st
                            ));
                          }}
                          rows="3"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`edit-priority-${subticket.id}`}>Priorité:</label>
                        <select
                          id={`edit-priority-${subticket.id}`}
                          value={subticket.priority}
                          onChange={(e) => {
                            const updatedPriority = e.target.value;
                            setSubtickets(subtickets.map(st => 
                              st.id === subticket.id ? { ...st, priority: updatedPriority } : st
                            ));
                          }}
                        >
                          {priorityOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`edit-client-${subticket.id}`}>Client concerné:</label>
                        <Select
                          id={`edit-client-${subticket.id}`}
                          options={clientOptions}
                          value={subticket.clientConcerned}
                          onChange={(selectedClient) => {
                            setSubtickets(subtickets.map(st => 
                              st.id === subticket.id ? { ...st, clientConcerned: selectedClient } : st
                            ));
                          }}
                          placeholder="Sélectionner un client..."
                          isClearable
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`edit-status-${subticket.id}`}>Statut:</label>
                        <select
                          id={`edit-status-${subticket.id}`}
                          value={subticket.status || 'ouvert'}
                          onChange={(e) => {
                            const updatedStatus = e.target.value;
                            setSubtickets(subtickets.map(st => 
                              st.id === subticket.id ? { ...st, status: updatedStatus } : st
                            ));
                          }}
                        >
                          {statusOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`edit-type-${subticket.id}`}>Type de ticket:</label>
                        <select
                          id={`edit-type-${subticket.id}`}
                          value={subticket.ticketType || ''}
                          onChange={(e) => {
                            const updatedType = e.target.value;
                            setSubtickets(subtickets.map(st => 
                              st.id === subticket.id ? { ...st, ticketType: updatedType } : st
                            ));
                          }}
                        >
                          <option value="">-- Sélectionner un type --</option>
                          {ticketTypeOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`edit-duedate-${subticket.id}`}>Échéance:</label>
                        <input 
                          type="date" 
                          id={`edit-duedate-${subticket.id}`}
                          value={subticket.dueDate || ''}
                          onChange={(e) => {
                            const updatedDueDate = e.target.value;
                            setSubtickets(subtickets.map(st => 
                              st.id === subticket.id ? { ...st, dueDate: updatedDueDate } : st
                            ));
                          }}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`edit-reminderdate-${subticket.id}`}>Rappel:</label>
                        <input 
                          type="date" 
                          id={`edit-reminderdate-${subticket.id}`}
                          value={subticket.reminderDate || ''}
                          onChange={(e) => {
                            const updatedReminderDate = e.target.value;
                            setSubtickets(subtickets.map(st => 
                              st.id === subticket.id ? { ...st, reminderDate: updatedReminderDate } : st
                            ));
                          }}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`edit-remindertype-${subticket.id}`}>Type de rappel:</label>
                        <select
                          id={`edit-remindertype-${subticket.id}`}
                          value={subticket.reminderType || 'email'}
                          onChange={(e) => {
                            const updatedReminderType = e.target.value;
                            setSubtickets(subtickets.map(st => 
                              st.id === subticket.id ? { ...st, reminderType: updatedReminderType } : st
                            ));
                          }}
                        >
                          {reminderTypeOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`edit-assignedUsers-${subticket.id}`}>Assigner à:</label>
                        <Select
                          id={`edit-assignedUsers-${subticket.id}`}
                          options={userOptions}
                          isMulti
                          value={subticket.assignedUsers || []}
                          onChange={(selectedUsers) => {
                            setSubtickets(subtickets.map(st => 
                              st.id === subticket.id ? { ...st, assignedUsers: selectedUsers } : st
                            ));
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn">Créer le ticket</button>
      </form>

      {isAddSubticketModalOpen && (
        <div className="subticket-modal-overlay">
          <div className="subticket-modal">
            <div className="subticket-modal-content">
              <h3>{editingSubticketId ? 'Modifier le sous-ticket' : 'Ajouter un sous-ticket'}</h3>

              <div className="form-group">
                <label htmlFor="subticket-title">Titre *</label>
                <input
                  type="text"
                  id="subticket-title"
                  value={newSubticket.title}
                  onChange={e => setNewSubticket({ ...newSubticket, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subticket-description">Description *</label>
                <textarea
                  id="subticket-description"
                  value={newSubticket.description}
                  onChange={e => setNewSubticket({ ...newSubticket, description: e.target.value })}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subticket-priority">Priorité</label>
                <select
                  id="subticket-priority"
                  value={newSubticket.priority}
                  onChange={e => setNewSubticket({ ...newSubticket, priority: e.target.value })}
                >
                  {priorityOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="subticket-client">Client concerné</label>
                <Select
                  id="subticket-client"
                  options={clientOptions}
                  value={newSubticket.clientConcerned}
                  onChange={selectedClient => setNewSubticket({ ...newSubticket, clientConcerned: selectedClient })}
                  placeholder="Sélectionner un client..."
                  isClearable
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subticket-assignedUsers">Assigner à</label>
                <Select
                  id="subticket-assignedUsers"
                  options={userOptions}
                  isMulti
                  value={newSubticket.assignedUsers}
                  onChange={selectedUsers => setNewSubticket({ ...newSubticket, assignedUsers: selectedUsers })}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subticket-status">Statut</label>
                <select
                  id="subticket-status"
                  value={newSubticket.status}
                  onChange={e => setNewSubticket({ ...newSubticket, status: e.target.value })}
                >
                  {statusOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="subticket-type">Type de ticket (optionnel)</label>
                <select
                  id="subticket-type"
                  value={newSubticket.ticketType}
                  onChange={e => setNewSubticket({ ...newSubticket, ticketType: e.target.value })}
                >
                  <option value="">-- Sélectionner un type --</option>
                  {ticketTypeOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="subticket-dueDate">Échéance</label>
                <input
                  type="date"
                  id="subticket-dueDate"
                  value={newSubticket.dueDate}
                  onChange={e => setNewSubticket({ ...newSubticket, dueDate: e.target.value })}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group reminder-group">
                  <label htmlFor="subticket-reminderDate">Rappel</label>
                  <input
                    type="date"
                    id="subticket-reminderDate"
                    value={newSubticket.reminderDate}
                    onChange={e => setNewSubticket({ ...newSubticket, reminderDate: e.target.value })}
                  />
                </div>
                
                <div className="form-group reminder-type-group">
                  <label htmlFor="subticket-reminderType">Type de rappel</label>
                  <select
                    id="subticket-reminderType"
                    value={newSubticket.reminderType}
                    onChange={e => setNewSubticket({ ...newSubticket, reminderType: e.target.value })}
                  >
                    {reminderTypeOptions.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              </div>

              <div className="subticket-modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsAddSubticketModalOpen(false)}>
                  Annuler
                </button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSaveSubticket}
                  disabled={!newSubticket.title.trim() || !newSubticket.description.trim()}
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateTicketForm;