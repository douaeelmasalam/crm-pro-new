import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TicketsByUserChart = ({ apiUrl = 'http://localhost:5000/api' }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userLines, setUserLines] = useState([]);

  // Couleurs pour les différents utilisateurs
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#0088fe', '#00c49f', '#ffbb28', '#ff8042', '#8dd1e1',
    '#d084d0', '#82d982', '#ffb347', '#87ceeb', '#dda0dd',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
  ];

  const fetchTicketsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}/tickets`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const tickets = await response.json();
      
      processChartData(tickets);

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (tickets) => {
    console.log('📊 Données des tickets reçues:', tickets); // Debug
    
    // Filtrer seulement les tickets qui ont des utilisateurs assignés
    const assignedTickets = tickets.filter(ticket => {
      const hasAssignedUsers = ticket.assignedUsers && 
                              Array.isArray(ticket.assignedUsers) && 
                              ticket.assignedUsers.length > 0;
      
      console.log('🎫 Ticket:', ticket.title, 'Assigné:', hasAssignedUsers, 'Users:', ticket.assignedUsers); // Debug
      return hasAssignedUsers;
    });

    console.log('✅ Tickets assignés filtrés:', assignedTickets.length); // Debug

    if (assignedTickets.length === 0) {
      setChartData([]);
      setUserLines([]);
      return;
    }

    // Extraire tous les utilisateurs uniques
    const usersMap = new Map();
    assignedTickets.forEach(ticket => {
      ticket.assignedUsers.forEach(user => {
        const userName = getUserName(user);
        console.log('👤 Utilisateur détecté:', userName, 'pour ticket:', ticket.title); // Debug
        
        if (!usersMap.has(userName)) {
          usersMap.set(userName, {
            name: userName,
            user: user,
            tickets: []
          });
        }
        usersMap.get(userName).tickets.push(ticket);
      });
    });

    const users = Array.from(usersMap.values());
    console.log('👥 Utilisateurs uniques trouvés:', users.map(u => u.name)); // Debug

    // Créer un ensemble de toutes les dates depuis la création du premier ticket jusqu'à aujourd'hui
    const today = new Date();
    const allDates = new Set();
    
    // Ajouter toutes les dates depuis la création de chaque ticket
    assignedTickets.forEach(ticket => {
      if (ticket.createdAt) {
        const createdDate = new Date(ticket.createdAt);
        let currentDate = new Date(createdDate);
        
        // Ajouter chaque jour depuis la création jusqu'à aujourd'hui
        while (currentDate <= today) {
          allDates.add(currentDate.toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });

    const sortedDates = Array.from(allDates).sort();
    console.log('📅 Dates générées:', sortedDates.slice(0, 5), '... (total:', sortedDates.length, ')'); // Debug

    // Créer les données pour le graphique
    const chartDataArray = [];
    const userLinesData = [];

    // Pour chaque utilisateur, créer une ligne
    users.forEach((userData, userIndex) => {
      const color = colors[userIndex % colors.length];
      
      userLinesData.push({
        key: userData.name,
        color: color,
        userData: userData
      });
    });

    // Pour chaque date, calculer le nombre de tickets par utilisateur
    sortedDates.forEach(date => {
      const dateEntry = { date };
      
      // Pour chaque utilisateur
      users.forEach(userData => {
        const userName = userData.name;
        
        // Compter combien de tickets cet utilisateur avait à cette date
        const ticketsAtDate = userData.tickets.filter(ticket => {
          const createdDate = new Date(ticket.createdAt).toISOString().split('T')[0];
          return date >= createdDate; // Ticket créé avant ou à cette date
        });

        dateEntry[userName] = ticketsAtDate.length;
        dateEntry[`${userName}_tickets`] = ticketsAtDate;
      });
      
      chartDataArray.push(dateEntry);
    });

    console.log('📈 Données du graphique générées:', chartDataArray.length, 'points'); // Debug
    console.log('🎨 Lignes utilisateurs:', userLinesData.map(u => u.key)); // Debug

    setChartData(chartDataArray);
    setUserLines(userLinesData);
  };

  const getUserName = (user) => {
    if (!user) return 'Non assigné';
    
    // Si c'est un objet utilisateur
    if (typeof user === 'object') {
      // Essayer différentes propriétés possibles
      if (user.name) return user.name;
      if (user.username) return user.username;
      if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
      if (user.firstName) return user.firstName;
      if (user.email) return user.email;
      if (user.id) return `Utilisateur ${user.id}`;
    }
    
    // Si c'est une chaîne de caractères
    if (typeof user === 'string') {
      return user;
    }
    
    return 'Utilisateur';
  };

  // Gestionnaire de clic sur un point du graphique
  const handlePointClick = (data, userName) => {
    if (data && data[`${userName}_tickets`]) {
      const tickets = data[`${userName}_tickets`];
      
      setSelectedPoint({
        userName: userName,
        date: data.date,
        ticketCount: data[userName],
        tickets: tickets
      });
      setShowModal(true);
    }
  };

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label).toLocaleDateString('fr-FR');
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          maxWidth: '350px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '14px' }}>
            {`Date: ${date}`}
          </p>
          {payload.map((entry, index) => {
            const ticketData = chartData.find(d => d.date === label);
            const ticketCount = entry.value;
            const tickets = ticketData ? ticketData[`${entry.dataKey}_tickets`] : [];
            
            return (
              <div key={index} style={{ 
                margin: '4px 0', 
                padding: '8px',
                backgroundColor: '#f8f9fa',
                borderRadius: '3px',
                borderLeft: `3px solid ${entry.color}`
              }}>
                <p style={{ margin: '0', color: entry.color, fontWeight: 'bold', fontSize: '13px' }}>
                  {entry.dataKey}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#666' }}>
                  Nombre de tickets: {ticketCount}
                </p>
                {tickets.length > 0 && (
                  <div style={{ marginTop: '6px' }}>
                    <p style={{ margin: '0', fontSize: '11px', color: '#888', fontWeight: 'bold' }}>
                      Tickets assignés:
                    </p>
                    {tickets.slice(0, 3).map((ticket, idx) => (
                      <p key={idx} style={{ margin: '2px 0', fontSize: '10px', color: '#666' }}>
                        • {ticket.title.substring(0, 30)}...
                      </p>
                    ))}
                    {tickets.length > 3 && (
                      <p style={{ margin: '2px 0', fontSize: '10px', color: '#888', fontStyle: 'italic' }}>
                        et {tickets.length - 3} autre(s)...
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Modal pour afficher les détails des tickets
  const TicketDetailsModal = () => {
    if (!showModal || !selectedPoint) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }} onClick={() => setShowModal(false)}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80%',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '2px solid #eee',
            paddingBottom: '16px'
          }}>
            <h3 style={{ margin: 0, color: '#333' }}>
              Tickets de {selectedPoint.userName}
            </h3>
            <button 
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setShowModal(false)}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#555' }}>
              <strong>Date:</strong> {new Date(selectedPoint.date).toLocaleDateString('fr-FR')}
            </p>
            <p style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#555' }}>
              <strong>Nombre total de tickets:</strong> {selectedPoint.ticketCount}
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>Liste des tickets:</h4>
            {selectedPoint.tickets.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>Aucun ticket à cette date</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {selectedPoint.tickets.map((ticket, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #dee2e6'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h5 style={{ margin: '0', color: '#333', fontSize: '14px' }}>
                        {ticket.title}
                      </h5>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: getPriorityColor(ticket.priority),
                          color: 'white',
                          fontSize: '11px'
                        }}>
                          {ticket.priority}
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: getStatusColor(ticket.status),
                          color: 'white',
                          fontSize: '11px'
                        }}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                      {ticket.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
                      <span>Client: {ticket.clientConcerned}</span>
                      <span>Créé: {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      'ouvert': '#f39c12',
      'en cours': '#3498db',
      'résolu': '#27ae60',
      'fermé': '#95a5a6'
    };
    return colors[status] || '#gray';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'faible': '#27ae60',
      'moyenne': '#f39c12',
      'élevée': '#e67e22',
      'critique': '#e74c3c'
    };
    return colors[priority] || '#gray';
  };

  useEffect(() => {
    fetchTicketsData();
  }, []);

  if (loading) return (
    <div style={{ 
      textAlign: 'center', 
      padding: '40px',
      fontSize: '16px',
      color: '#666'
    }}>
      Chargement du graphique...
    </div>
  );
  
  if (error) return (
    <div style={{ 
      color: '#e74c3c', 
      textAlign: 'center', 
      padding: '40px',
      backgroundColor: '#fdf2f2',
      borderRadius: '8px',
      border: '1px solid #fecaca'
    }}>
      {error}
    </div>
  );

  if (chartData.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ color: '#666', margin: '0 0 8px 0' }}>Aucun ticket assigné</h4>
        <p style={{ color: '#888', margin: 0 }}>
          Créez des tickets et assignez-les à des utilisateurs pour voir le graphique
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#333' }}>
            Évolution du Nombre de Tickets par Utilisateur
          </h3>
  
        </div>
        <button 
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
          onClick={fetchTicketsData}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Actualiser
        </button>
      </div>
      
      <div style={{ 
        width: '100%', 
        height: '500px',
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 60,
              bottom: 100
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
              }}
              angle={-45}
              textAnchor="end"
              height={100}
              interval="preserveStartEnd"
              fontSize={12}
            />
            <YAxis 
              label={{ value: 'Nombre de Tickets', angle: -90, position: 'insideLeft' }}
              fontSize={12}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {userLines.map((userLine) => (
              <Line
                key={userLine.key}
                type="monotone"
                dataKey={userLine.key}
                stroke={userLine.color}
                strokeWidth={3}
                dot={{ 
                  fill: userLine.color, 
                  strokeWidth: 2, 
                  r: 5,
                  cursor: 'pointer'
                }}
                activeDot={{ 
                  r: 8, 
                  cursor: 'pointer',
                  onClick: (data) => handlePointClick(data.payload, userLine.key)
                }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ 
        marginTop: '24px', 
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ marginBottom: '12px' }}>
          <strong style={{ color: '#333' }}>Utilisateurs avec tickets assignés:</strong>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {userLines.map((userLine) => (
            <div key={userLine.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: userLine.color,
                borderRadius: '3px',
                border: '1px solid #ddd'
              }}></div>
              <span style={{ fontSize: '14px', color: '#555' }}>{userLine.key}</span>
            </div>
          ))}
        </div>
      </div>

      

      <TicketDetailsModal />
    </div>
  );
};

export default TicketsByUserChart;