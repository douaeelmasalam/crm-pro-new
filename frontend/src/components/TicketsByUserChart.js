import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TicketsByUserChart = ({ apiUrl = 'http://localhost:5000/api' }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userLines, setUserLines] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5 ; // Nombre de cercles par page

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
      // Données de test pour la démo
      const mockTickets = [
        {
          id: 1,
          title: 'Bug critique système',
          description: 'Le système plante régulièrement',
          priority: 'critique',
          status: 'ouvert',
          clientConcerned: 'Client A',
          createdAt: '2024-11-01T10:00:00Z',
          assignedUsers: [{ name: 'alice', id: 1 }]
        },
        {
          id: 2,
          title: 'Amélioration UI',
          description: 'Améliorer l\'interface utilisateur',
          priority: 'moyenne',
          status: 'en cours',
          clientConcerned: 'Client B',
          createdAt: '2024-11-15T14:30:00Z',
          assignedUsers: [{ name: 'lolo', id: 2 }]
        },
        {
          id: 3,
          title: 'Optimisation performance',
          description: 'Optimiser les performances de l\'application',
          priority: 'élevée',
          status: 'résolu',
          clientConcerned: 'Client C',
          createdAt: '2024-12-01T09:15:00Z',
          assignedUsers: [{ name: 'SARL', id: 3 }]
        },
        {
          id: 4,
          title: 'Formation utilisateurs',
          description: 'Former les nouveaux utilisateurs',
          priority: 'faible',
          status: 'fermé',
          clientConcerned: 'Client D',
          createdAt: '2024-12-10T16:45:00Z',
          assignedUsers: [{ name: 'ADIL', id: 4 }]
        },
        {
          id: 5,
          title: 'Migration données',
          description: 'Migrer les anciennes données',
          priority: 'critique',
          status: 'en cours',
          clientConcerned: 'Client E',
          createdAt: '2024-12-20T11:20:00Z',
          assignedUsers: [{ name: 'douaâe', id: 5 }]
        }
      ];
      processChartData(mockTickets);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (tickets) => {
    console.log('📊 Données des tickets reçues:', tickets);
    
    // Filtrer seulement les tickets qui ont des utilisateurs assignés
    const assignedTickets = tickets.filter(ticket => {
      const hasAssignedUsers = ticket.assignedUsers && 
                              Array.isArray(ticket.assignedUsers) && 
                              ticket.assignedUsers.length > 0;
      
      console.log('🎫 Ticket:', ticket.title, 'Assigné:', hasAssignedUsers, 'Users:', ticket.assignedUsers);
      return hasAssignedUsers;
    });

    console.log('✅ Tickets assignés filtrés:', assignedTickets.length);

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
        console.log('👤 Utilisateur détecté:', userName, 'pour ticket:', ticket.title);
        
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
    console.log('👥 Utilisateurs uniques trouvés:', users.map(u => u.name));

    // Créer un ensemble de dates importantes uniquement (créations de tickets + points clés)
    const importantDates = new Set();
    
    // Ajouter les dates de création de chaque ticket
    assignedTickets.forEach(ticket => {
      if (ticket.createdAt) {
        const createdDate = new Date(ticket.createdAt).toISOString().split('T')[0];
        importantDates.add(createdDate);
      }
    });

    // Ajouter quelques points intermédiaires pour lisser la courbe (une fois par semaine max)
    const sortedCreationDates = Array.from(importantDates).sort();
    if (sortedCreationDates.length > 1) {
      const firstDate = new Date(sortedCreationDates[0]);
      const lastDate = new Date(sortedCreationDates[sortedCreationDates.length - 1]);
      const today = new Date();
      
      // Ajouter des points hebdomadaires entre la première et dernière date
      let currentDate = new Date(firstDate);
      while (currentDate <= Math.min(lastDate, today)) {
        importantDates.add(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 7); // Ajouter 7 jours
      }
      
      // Ajouter aujourd'hui si c'est après la dernière création
      if (today > lastDate) {
        importantDates.add(today.toISOString().split('T')[0]);
      }
    }

    const sortedDates = Array.from(importantDates).sort();
    console.log('📅 Dates importantes générées:', sortedDates.length, 'points');

    // Créer les données pour le graphique
    const chartDataArray = [];
    const userLinesData = [];

    // Pour chaque utilisateur, créer une ligne
    users.forEach((userData, userIndex) => {
      const color = colors[userIndex % colors.length];
      
      userLinesData.push({
        key: userData.name,
        color: color,
        userData: userData,
        totalTickets: userData.tickets.length,
        completedTickets: userData.tickets.filter(t => t.status === 'résolu' || t.status === 'fermé').length
      });
    });

    // Pour chaque date importante, calculer le nombre de tickets par utilisateur
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

    console.log('📈 Données du graphique générées:', chartDataArray.length, 'points');
    console.log('🎨 Lignes utilisateurs:', userLinesData.map(u => u.key));

    setChartData(chartDataArray);
    setUserLines(userLinesData);
  };

  const calculateGlobalStats = () => {
    if (userLines.length === 0) return null;
    
    const totalTickets = userLines.reduce((sum, user) => sum + user.totalTickets, 0);
    const totalCompleted = userLines.reduce((sum, user) => sum + user.completedTickets, 0);
    const totalUsers = userLines.length;
    
    // Calculer les priorités et statuts
    const allTickets = userLines.flatMap(user => user.userData.tickets);
    const priorityStats = {
      critique: allTickets.filter(t => t.priority === 'critique').length,
      élevée: allTickets.filter(t => t.priority === 'élevée').length,
      moyenne: allTickets.filter(t => t.priority === 'moyenne').length,
      faible: allTickets.filter(t => t.priority === 'faible').length
    };
    
    const statusStats = {
      ouvert: allTickets.filter(t => t.status === 'ouvert').length,
      'en cours': allTickets.filter(t => t.status === 'en cours').length,
      résolu: allTickets.filter(t => t.status === 'résolu').length,
      fermé: allTickets.filter(t => t.status === 'fermé').length
    };
    
    return {
      totalTickets,
      totalCompleted,
      totalUsers,
      completionRate: totalTickets > 0 ? (totalCompleted / totalTickets) * 100 : 0,
      priorityStats,
      statusStats,
      allTickets
    };
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

  // Gestionnaire de clic sur un cercle utilisateur
  const handleCircleClick = (userLine) => {
    const latestData = chartData[chartData.length - 1];
    const tickets = latestData ? latestData[`${userLine.key}_tickets`] || [] : [];
    
    setSelectedPoint({
      userName: userLine.key,
      date: latestData ? latestData.date : new Date().toISOString().split('T')[0],
      ticketCount: userLine.totalTickets,
      tickets: userLine.userData.tickets
    });
    setShowModal(true);
  };

  // Composant CircleGauge pour afficher les cercles interactifs
  const CircleGauge = ({ userLine, size = 100 }) => {
    const { totalTickets, completedTickets, color, key: userName } = userLine;
    const percentage = totalTickets > 0 ? (completedTickets / totalTickets) * 100 : 0;
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '12px',
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          backgroundColor: 'white',
          border: '2px solid #e0e0e0',
          minWidth: '140px',
          position: 'relative',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
        onClick={() => handleCircleClick(userLine)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
          e.currentTarget.style.borderColor = color;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
          e.currentTarget.style.borderColor = '#e0e0e0';
        }}
      >
        {/* Ligne colorée en haut */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: color,
          borderRadius: '10px 10px 0 0'
        }} />
        
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            {/* Cercle de fond */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f0f0f0"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Cercle de progression */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.8s ease-in-out',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
          </svg>
          {/* Texte au centre */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              {totalTickets}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#888',
              fontWeight: '500'
            }}>
              TOTAL
            </div>
          </div>
        </div>
        
        {/* Nom de l'utilisateur */}
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#333',
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          {userName}
        </div>
        
        {/* Stats avec lignes colorées */}
        <div style={{
          fontSize: '11px',
          color: '#666',
          textAlign: 'center',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginBottom: '4px'
          }}>
            <div style={{
              width: '3px',
              height: '12px',
              backgroundColor: '#27ae60',
              borderRadius: '2px'
            }} />
            <span>Terminés: {completedTickets}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '3px',
              height: '12px',
              backgroundColor: color,
              borderRadius: '2px'
            }} />
            <span>Progression: {Math.round(percentage)}%</span>
          </div>
        </div>
      </div>
    );
  };

  const GlobalSummaryCircle = ({ globalStats, size = 160 }) => {
    if (!globalStats) return null;
    
    const { totalTickets, totalCompleted, totalUsers, completionRate } = globalStats;
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (completionRate / 100) * circumference;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '20px',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        backgroundColor: 'white',
        border: '3px solid #e0e0e0',
        minWidth: '200px',
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}
      onClick={() => {
        setSelectedPoint({
          userName: 'Résumé Global',
          date: new Date().toISOString().split('T')[0],
          ticketCount: totalTickets,
          tickets: globalStats.allTickets,
          isGlobalSummary: true,
          globalStats: globalStats
        });
        setShowModal(true);
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
      }}>
        
        {/* Dégradé coloré en haut */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #8884d8, #82ca9d, #ffc658, #ff7300)',
          borderRadius: '13px 13px 0 0'
        }} />
        
        <h4 style={{
          margin: '0 0 16px 0',
          color: '#333',
          fontSize: '16px',
          fontWeight: '700',
          textAlign: 'center'
        }}>
          Résumé Global
        </h4>
        
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            {/* Cercle de fond */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f0f0f0"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Cercle de progression */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 1s ease-in-out',
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))'
              }}
            />
            {/* Dégradé pour le cercle */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8884d8" />
                <stop offset="33%" stopColor="#82ca9d" />
                <stop offset="66%" stopColor="#ffc658" />
                <stop offset="100%" stopColor="#ff7300" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Texte au centre */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '2px'
            }}>
              {totalTickets}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              fontWeight: '600'
            }}>
              TICKETS
            </div>
          </div>
        </div>
        
        {/* Statistiques en bas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          width: '100%',
          fontSize: '12px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '8px',
            backgroundColor: 'rgba(136, 132, 216, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(136, 132, 216, 0.2)'
          }}>
            <div style={{ fontWeight: 'bold', color: '#8884d8', fontSize: '16px' }}>
              {totalUsers}
            </div>
            <div style={{ color: '#666', fontSize: '10px' }}>
              Utilisateurs
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '8px',
            backgroundColor: 'rgba(130, 202, 157, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(130, 202, 157, 0.2)'
          }}>
            <div style={{ fontWeight: 'bold', color: '#82ca9d', fontSize: '16px' }}>
              {totalCompleted}
            </div>
            <div style={{ color: '#666', fontSize: '10px' }}>
              Terminés
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '8px',
            backgroundColor: 'rgba(255, 198, 88, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 198, 88, 0.2)',
            gridColumn: '1 / -1'
          }}>
            <div style={{ fontWeight: 'bold', color: '#ffc658', fontSize: '16px' }}>
              {Math.round(completionRate)}%
            </div>
            <div style={{ color: '#666', fontSize: '10px' }}>
              Taux de Completion
            </div>
          </div>
        </div>
      </div>
    );
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
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          maxWidth: '250px',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', fontSize: '12px' }}>
            {`Date: ${date}`}
          </p>
          {payload.map((entry, index) => {
            const ticketData = chartData.find(d => d.date === label);
            const ticketCount = entry.value;
            
            return (
              <div key={index} style={{ 
                margin: '2px 0', 
                padding: '4px',
                backgroundColor: '#f8f9fa',
                borderRadius: '2px',
                borderLeft: `2px solid ${entry.color}`
              }}>
                <p style={{ margin: '0', color: entry.color, fontWeight: 'bold', fontSize: '11px' }}>
                  {entry.dataKey}
                </p>
                <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: '#666' }}>
                  Tickets: {ticketCount}
                </p>
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
          maxWidth: '600px',
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
              {selectedPoint.isGlobalSummary ? 'Résumé Global' : `Tickets de ${selectedPoint.userName}`}
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
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            {selectedPoint.isGlobalSummary ? (
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#555' }}>
                  <strong>Vue d'ensemble de tous les tickets</strong>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                    <strong>Priorités:</strong>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      <div>Critique: {selectedPoint.globalStats.priorityStats.critique}</div>
                      <div>Élevée: {selectedPoint.globalStats.priorityStats.élevée}</div>
                      <div>Moyenne: {selectedPoint.globalStats.priorityStats.moyenne}</div>
                      <div>Faible: {selectedPoint.globalStats.priorityStats.faible}</div>
                    </div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                    <strong>Statuts:</strong>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      <div>Ouvert: {selectedPoint.globalStats.statusStats.ouvert}</div>
                      <div>En cours: {selectedPoint.globalStats.statusStats['en cours']}</div>
                      <div>Résolu: {selectedPoint.globalStats.statusStats.résolu}</div>
                      <div>Fermé: {selectedPoint.globalStats.statusStats.fermé}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#555' }}>
                  <strong>Date:</strong> {new Date(selectedPoint.date).toLocaleDateString('fr-FR')}
                </p>
                <p style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#555' }}>
                  <strong>Nombre total de tickets:</strong> {selectedPoint.ticketCount}
                </p>
              </div>
            )}
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
      padding: '20px',
      fontSize: '14px',
      color: '#666'
    }}>
      Chargement du graphique...
    </div>
  );
  
  if (error) return (
    <div style={{ 
      color: '#e74c3c', 
      textAlign: 'center', 
      padding: '20px',
      backgroundColor: '#fdf2f2',
      borderRadius: '6px',
      border: '1px solid #fecaca',
      fontSize: '14px'
    }}>
      Erreur de connexion - Affichage des données de démonstration
    </div>
  );

  if (chartData.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ color: '#666', margin: '0 0 8px 0', fontSize: '16px' }}>Aucun ticket assigné</h4>
        <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>
          Créez des tickets et assignez-les à des utilisateurs pour voir le graphique
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', maxWidth: '1200px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px'
      }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '18px' }}>
            Évolution des Tickets par Utilisateur
          </h3>
        </div>
        <button 
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500'
          }}
          onClick={fetchTicketsData}
        >
          Actualiser
        </button>
      </div>
      
      {/* Section principale avec graphique et cercles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Graphique principal */}
        <div style={{ 
          width: '100%',
          height: '400px',
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 15,
                right: 20,
                left: 40,
                bottom: 60
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
                height={60}
                interval={0}
                fontSize={10}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                label={{ value: 'Tickets', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                fontSize={10}
                allowDecimals={false}
                tick={{ fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              
              {userLines.map((userLine) => (
                <Line
                  key={userLine.key}
                  type="monotone"
                  dataKey={userLine.key}
                  stroke={userLine.color}
                  strokeWidth={2}
                  dot={{ 
                    fill: userLine.color, 
                    strokeWidth: 1, 
                    r: 3
                  }}
                  activeDot={{ 
                    r: 5, 
                    cursor: 'pointer',
                    onClick: (data) => handlePointClick(data.payload, userLine.key)
                  }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cercles interactifs horizontaux avec navigation */}
  
<div style={{ 
  marginTop: '20px',
  backgroundColor: 'white',
  border: '1px solid #dee2e6',
  borderRadius: '8px',
  padding: '20px'
}}>
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  }}>
    <h4 style={{ 
      margin: '0', 
      color: '#333', 
      fontSize: '18px',
      fontWeight: '600'
    }}>
      Statistiques
    </h4>
    
    {/* Navigation - seulement visible s'il y a plus d'utilisateurs que itemsPerPage */}
    {userLines.length > itemsPerPage && (
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        <button
          style={{
            padding: '8px 12px',
            backgroundColor: currentPage > 0 ? '#007bff' : '#e9ecef',
            color: currentPage > 0 ? 'white' : '#6c757d',
            border: 'none',
            borderRadius: '6px',
            cursor: currentPage > 0 ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          ← Précédent
        </button>
        
        <span style={{
          fontSize: '12px',
          color: '#666',
          padding: '0 8px'
        }}>
          {currentPage + 1} / {Math.ceil((userLines.length) / itemsPerPage)}
        </span>
        
        <button
          style={{
            padding: '8px 12px',
            backgroundColor: currentPage < Math.ceil((userLines.length) / itemsPerPage) - 1 ? '#007bff' : '#e9ecef',
            color: currentPage < Math.ceil((userLines.length) / itemsPerPage) - 1 ? 'white' : '#6c757d',
            border: 'none',
            borderRadius: '6px',
            cursor: currentPage < Math.ceil((userLines.length) / itemsPerPage) - 1 ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setCurrentPage(Math.min(Math.ceil((userLines.length) / itemsPerPage) - 1, currentPage + 1))}
          disabled={currentPage >= Math.ceil((userLines.length) / itemsPerPage) - 1}
        >
          Suivant →
        </button>
      </div>
    )}
  </div>
  
  {/* Conteneur principal pour les cercles */}
  <div style={{
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    minHeight: '200px'
  }}>
    {/* Cercle global - toujours visible */}
    <GlobalSummaryCircle globalStats={calculateGlobalStats()} size={140} />
    
    {/* Séparateur visuel */}
    <div style={{
      height: '120px',
      width: '1px',
      backgroundColor: '#e0e0e0',
      margin: '0 10px'
    }}></div>
    
    {/* Cercles des utilisateurs avec pagination */}
    <div style={{
      display: 'flex',
      gap: '20px',
      flex: 1,
      justifyContent: userLines.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).length < 3 ? 'center' : 'flex-start',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      {userLines
        .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
        .map((userLine) => (
          <CircleGauge key={userLine.key} userLine={userLine} size={100} />
        ))}
    </div>
  </div>
  
  {/* Indicateurs de pagination */}
  {userLines.length > itemsPerPage && (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '6px',
      marginTop: '16px'
    }}>
      {Array.from({ length: Math.ceil(userLines.length / itemsPerPage) }, (_, index) => (
        <button
          key={index}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: index === currentPage ? '#007bff' : '#e9ecef',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setCurrentPage(index)}
        />
      ))}
    </div>
  )}
</div>
      </div>

      <div style={{ 
        marginTop: '16px', 
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ color: '#333', fontSize: '14px' }}>Légende:</strong>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {userLines.map((userLine) => (
            <div key={userLine.key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: userLine.color,
                borderRadius: '2px',
                border: '1px solid #ddd'
              }}></div>
              <span style={{ fontSize: '12px', color: '#555' }}>
                {userLine.key} ({userLine.totalTickets} tickets)
              </span>
            </div>
          ))}
        </div>
      </div>

      <TicketDetailsModal />
    </div>
  );
};

export default TicketsByUserChart;