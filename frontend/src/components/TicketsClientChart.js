import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';



const TicketsClientChart = ({ apiUrl = 'http://localhost:5000/api' }) => {
  const [ticketsData, setTicketsData] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientMetrics, setClientMetrics] = useState({});
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(false); // État pour le toggle debug

  // Couleurs pour les différents statuts
  const statusColors = {
    'Ouvert': '#3498db',
    'En Cours': '#f39c12', 
    'Résolu': '#2ecc71',
    'Fermé': '#95a5a6'
  };

  // Données de démonstration pour tester le composant
  const demoData = {
    tickets: [
      { id: 1, title: "Problème serveur", status: "ouvert", clientConcerned: "Entreprise A", client_id: "ent_a" },
      { id: 2, title: "Bug application", status: "en cours", clientConcerned: "Entreprise B", client_id: "ent_b" },
      { id: 3, title: "Demande feature", status: "résolu", clientConcerned: "Entreprise A", client_id: "ent_a" },
      { id: 4, title: "Support technique", status: "fermé", clientConcerned: "Entreprise C", client_id: "ent_c" },
      { id: 5, title: "Installation", status: "ouvert", clientConcerned: "Entreprise B", client_id: "ent_b" },
      { id: 6, title: "Formation", status: "en cours", clientConcerned: "Entreprise A", client_id: "ent_a" },
    ],
    clients: [
      { id: "ent_a", nom: "Entreprise A" },
      { id: "ent_b", nom: "Entreprise B" },
      { id: "ent_c", nom: "Entreprise C" }
    ]
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (ticketsData.length > 0) {
      processTicketsByClient();
    }
  }, [ticketsData, clientsData]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Si pas de token ou en mode démo, utiliser les données de démonstration
      if (!token) {
        console.log('🎭 Mode démonstration activé');
        setTicketsData(demoData.tickets);
        setClientsData(demoData.clients);
        setDebugInfo({
          ticketsCount: demoData.tickets.length,
          clientsCount: demoData.clients.length,
          sampleTicket: demoData.tickets[0],
          sampleClient: demoData.clients[0],
          mode: 'demo'
        });
        setLoading(false);
        return;
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('🔍 Début de la récupération des données...');
      
      const [ticketsResponse, clientsResponse] = await Promise.all([
        fetch(`${apiUrl}/tickets`, { headers }).then(res => {
          console.log('📊 Réponse tickets:', res.status);
          if (!res.ok) throw new Error(`Erreur tickets: ${res.status}`);
          return res.json();
        }).catch(err => {
          console.warn('⚠️ Erreur tickets:', err);
          return [];
        }),
        fetch(`${apiUrl}/clients`, { headers }).then(res => {
          console.log('👥 Réponse clients:', res.status);
          if (!res.ok) throw new Error(`Erreur clients: ${res.status}`);
          return res.json();
        }).catch(err => {
          console.warn('⚠️ Erreur clients:', err);
          return [];
        })
      ]);
      
      console.log('📊 Tickets récupérés:', ticketsResponse.length);
      console.log('👥 Clients récupérés:', clientsResponse.length);
      
      setTicketsData(ticketsResponse);
      setClientsData(clientsResponse);
      
      setDebugInfo({
        ticketsCount: ticketsResponse.length,
        clientsCount: clientsResponse.length,
        sampleTicket: ticketsResponse[0] || null,
        sampleClient: clientsResponse[0] || null,
        mode: 'api'
      });
      
    } catch (err) {
      console.error('❌ Erreur lors du chargement des données:', err);
      setError(`Erreur lors du chargement des données: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const processTicketsByClient = () => {
    console.log('🔄 Début du traitement des données...');
    
    if (!ticketsData.length) {
      console.log('⚠️ Aucun ticket à traiter');
      return;
    }

    // Vérifier que clientsData est un tableau
    const clientsArray = Array.isArray(clientsData) ? clientsData : [];
    console.log('👥 Clients array:', clientsArray);

    // Créer un mapping client_id -> nom_client
    const clientMapping = clientsArray.reduce((acc, client) => {
      const clientId = client.id || client._id || client.client_id;
      const clientName = client.nom || client.name || client.company_name || 'Client Inconnu';
      
      if (clientId) {
        acc[clientId] = clientName;
        acc[String(clientId)] = clientName;
      }
      
      return acc;
    }, {});

    console.log('🗺️ Mapping clients:', clientMapping);

    // Normaliser les statuts
    const statusMapping = {
      'ouvert': 'Ouvert',
      'Ouvert': 'Ouvert',
      'pending': 'Ouvert',
      'En attente': 'Ouvert',
      'open': 'Ouvert',
      'en cours': 'En Cours',
      'En Cours': 'En Cours',
      'En cours': 'En Cours',
      'in-progress': 'En Cours',
      'in_progress': 'En Cours',
      'résolu': 'Résolu',
      'Résolu': 'Résolu',
      'resolved': 'Résolu',
      'resolu': 'Résolu',
      'fermé': 'Fermé',
      'Fermé': 'Fermé',
      'closed': 'Fermé',
      'ferme': 'Fermé'
    };

    // Traiter les tickets
    const ticketsByClient = {};
    const clientMetricsData = {};
    let processedTicketsCount = 0;
    let unmatchedTickets = [];

    ticketsData.forEach(ticket => {
      // Essayer différents champs pour identifier le client
      const clientId = ticket.client_id || ticket.clientId || ticket.client || ticket.assignedTo;
      let clientName = clientMapping[clientId] || clientMapping[String(clientId)];
      
      // Si pas de correspondance, essayer avec clientConcerned ou client_name
      if (!clientName && ticket.clientConcerned) {
        clientName = ticket.clientConcerned;
      } else if (!clientName && ticket.client_name) {
        clientName = ticket.client_name;
      } else if (!clientName) {
        clientName = `Client ${clientId || 'Inconnu'}`;
        unmatchedTickets.push({ ticketId: ticket.id || ticket._id, clientId });
      }

      const normalizedStatus = statusMapping[ticket.status] || ticket.status || 'Statut Inconnu';

      if (!ticketsByClient[clientName]) {
        ticketsByClient[clientName] = {};
        clientMetricsData[clientName] = {
          total: 0,
          'Ouvert': 0,
          'En Cours': 0,
          'Résolu': 0,
          'Fermé': 0
        };
      }

      if (!ticketsByClient[clientName][normalizedStatus]) {
        ticketsByClient[clientName][normalizedStatus] = 0;
      }

      ticketsByClient[clientName][normalizedStatus]++;
      
      // Mettre à jour les métriques
      if (clientMetricsData[clientName][normalizedStatus] !== undefined) {
        clientMetricsData[clientName][normalizedStatus]++;
      }
      clientMetricsData[clientName].total++;
      processedTicketsCount++;
    });

    console.log('📈 Tickets traités:', processedTicketsCount);
    console.log('🔍 Tickets non appariés:', unmatchedTickets);


    // Convertir en format pour les graphiques
    const chartData = [];
    Object.entries(ticketsByClient).forEach(([clientName, statuses]) => {
      Object.entries(statuses).forEach(([status, count]) => {
        chartData.push({
          client: clientName,
          status: status,
          count: count
        });
      });
    });

    console.log('📊 Données du graphique:', chartData);

    setProcessedData(chartData);
    setClientMetrics(clientMetricsData);

    setDebugInfo(prev => ({
      ...prev,
      processedTicketsCount,
      unmatchedTicketsCount: unmatchedTickets.length,
      clientMappingCount: Object.keys(clientMapping).length,
      chartDataLength: chartData.length,
      clientsArrayLength: clientsArray.length,
      clientsDataType: typeof clientsData
    }));
  };

  const getBarChartData = () => {
    const clients = [...new Set(processedData.map(item => item.client))];
    return clients.map(client => {
      const clientData = { client };
      processedData
        .filter(item => item.client === client)
        .forEach(item => {
          clientData[item.status] = item.count;
        });
      return clientData;
    });
  };

  const getPieChartData = () => {
    const totalsByStatus = {};
    processedData.forEach(item => {
      if (!totalsByStatus[item.status]) {
        totalsByStatus[item.status] = 0;
      }
      totalsByStatus[item.status] += item.count;
    });

    return Object.entries(totalsByStatus).map(([status, count]) => ({
      name: status,
      value: count,
      color: statusColors[status] || '#bdc3c7'
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '5px',
          padding: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{`Client: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              color: entry.color, 
              margin: '2px 0',
              fontSize: '14px'
            }}>
              {`${entry.dataKey}: ${entry.value} ticket(s)`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ClientMetricsCard = ({ clientName, metrics }) => (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '15px',
      margin: '10px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minWidth: '200px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{clientName}</h4>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db', marginBottom: '10px' }}>
        {metrics.total} tickets
      </div>
      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
        <div>• Ouverts: {metrics['Ouvert']}</div>
        <div>• En cours: {metrics['En Cours']}</div>
        <div>• Résolus: {metrics['Résolu']}</div>
        <div>• Fermés: {metrics['Fermé']}</div>
      </div>
    </div>
  );

  const DebugPanel = () => (
    <div style={{
      backgroundColor: debugInfo.mode === 'demo' ? '#fff3cd' : '#f8f9fa',
      border: `1px solid ${debugInfo.mode === 'demo' ? '#ffeaa7' : '#e9ecef'}`,
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px',
      fontSize: '14px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
        🔍 Informations de Debug {debugInfo.mode === 'demo' && '(Mode Démonstration)'}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        <div>📊 Tickets récupérés: {debugInfo.ticketsCount || 0}</div>
        <div>👥 Clients récupérés: {debugInfo.clientsCount || 0}</div>
        <div>📋 Type clients data: {debugInfo.clientsDataType || 'undefined'}</div>
        <div>✅ Tickets traités: {debugInfo.processedTicketsCount || 0}</div>
        <div>❌ Tickets non appariés: {debugInfo.unmatchedTicketsCount || 0}</div>
        <div>🗺️ Mappings clients: {debugInfo.clientMappingCount || 0}</div>
        <div>📈 Points de données: {debugInfo.chartDataLength || 0}</div>
      </div>
      {debugInfo.sampleTicket && (
        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Exemple de ticket</summary>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(debugInfo.sampleTicket, null, 2)}
          </pre>
        </details>
      )}
      {debugInfo.sampleClient && (
        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Exemple de client</summary>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(debugInfo.sampleClient, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '16px',
        color: '#7f8c8d'
      }}>
        Chargement des données...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '16px',
          color: '#e74c3c',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div>{error}</div>
          <button 
            onClick={fetchData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Réessayer
          </button>
        </div>
        {showDebug && <DebugPanel />}
      </div>
    );
  }

  if (processedData.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '16px',
          color: '#7f8c8d',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div>❌ Aucune donnée disponible</div>
          <button 
            onClick={fetchData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
             Recharger les données
          </button>
        </div>
        {showDebug && <DebugPanel />}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {showDebug && <DebugPanel />}

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
 
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => setShowDebug(!showDebug)}
            style={{
              padding: '4px 8px',
              backgroundColor: showDebug ? '#e74c3c' : '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {showDebug ? ' Masquer Debug' : ' Debug'}
          </button>
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
          >
            <option value="bar"> Barres groupées</option>
            <option value="pie"> Camembert</option>
          </select>
          <button 
            onClick={fetchData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Actualiser
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>📈 Résumé par Client</h3>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '10px',
          justifyContent: 'flex-start'
        }}>
          {Object.entries(clientMetrics)
            .sort(([,a], [,b]) => b.total - a.total)
            .map(([clientName, metrics]) => (
              <ClientMetricsCard 
                key={clientName} 
                clientName={clientName} 
                metrics={metrics} 
              />
            ))}
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {chartType === 'bar' ? (
         <ResponsiveContainer width="100%" height={400}>
  <BarChart data={getBarChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis 
      dataKey="client" 
      angle={-45}
      textAnchor="end"
      height={100}
      interval={0}
    />
    <YAxis 
      domain={[0, 'dataMax + 1']} // Définit le domaine pour commencer à 0 et s'étendre jusqu'au maximum + 1
      allowDecimals={false} // Désactive les valeurs décimales
    />
    <Tooltip content={<CustomTooltip />} />
    <Legend />
    {Object.keys(statusColors).map(status => (
      <Bar 
        key={status}
        dataKey={status} 
        fill={statusColors[status]}
        name={status}
      />
    ))}
  </BarChart>
</ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={getPieChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {getPieChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} ticket(s)`, 'Quantité']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ 
        marginTop: '30px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>📋 Données Détaillées</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Client</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Ouvert</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>En Cours</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Résolu</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Fermé</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(clientMetrics)
                .sort(([,a], [,b]) => b.total - a.total)
                .map(([clientName, metrics], index) => (
                  <tr key={clientName} style={{ 
                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                  }}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: '500' }}>
                      {clientName}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                      {metrics['Ouvert']}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                      {metrics['En Cours']}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                      {metrics['Résolu']}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                      {metrics['Fermé']}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      borderBottom: '1px solid #dee2e6',
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      {metrics.total}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TicketsClientChart;