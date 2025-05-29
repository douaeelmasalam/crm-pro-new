import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/TicketsClientChart.css';

const TicketsClientChart = ({ apiUrl = 'http://localhost:5000/api' }) => {
  const [ticketsData, setTicketsData] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientMetrics, setClientMetrics] = useState({});
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(false);

  // Couleurs pour les différents statuts
  const statusColors = {
    'Ouvert': '#3498db',
    'En Cours': '#f39c12', 
    'Résolu': '#2ecc71',
    'Fermé': '#95a5a6'
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
      
      if (!token) {
        setError('Token d\'authentification manquant. Veuillez vous connecter.');
        setLoading(false);
        return;
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log(' Début de la récupération des données...');
      
      const [ticketsResponse, clientsResponse] = await Promise.all([
        fetch(`${apiUrl}/tickets`, { headers }).then(res => {
          console.log(' Réponse tickets:', res.status);
          if (!res.ok) throw new Error(`Erreur tickets: ${res.status}`);
          return res.json();
        }),
        fetch(`${apiUrl}/clients`, { headers }).then(res => {
          console.log(' Réponse clients:', res.status);
          if (!res.ok) throw new Error(`Erreur clients: ${res.status}`);
          return res.json();
        })
      ]);
      
      console.log(' Tickets récupérés:', ticketsResponse.length);
      console.log(' Clients récupérés:', clientsResponse.length);
      
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
  // Créer un mapping ID client -> nom
  const clientIdToName = clientsData.reduce((map, client) => {
    map[client._id] = client.nom || client.name || client.company_name || 'Client Inconnu';
    return map;
  }, {});

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

  ticketsData.forEach(ticket => {
    // Obtenir le nom du client à partir de son ID
    const clientId = ticket.client_id || ticket.clientConcerned;
    const clientName = clientIdToName[clientId] || `Client Inconnu (ID: ${clientId || 'N/A'})`;
    
    const normalizedStatus = statusMapping[ticket.status?.toLowerCase()] || ticket.status || 'Statut Inconnu';

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

  setProcessedData(chartData);
  setClientMetrics(clientMetricsData);

  setDebugInfo(prev => ({
    ...prev,
    processedTicketsCount,
    clientMapping: clientIdToName,
    chartDataLength: chartData.length,
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
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Client: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value} ticket(s)`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ClientMetricsCard = ({ clientName, metrics }) => (
    <div className="client-metric-card">
      <h4 title={clientName}>{clientName}</h4>
      <div className="client-total-tickets">
        {metrics.total} tickets
      </div>
      <div className="client-status-details">
        <div><span>• Ouverts:</span><span>{metrics['Ouvert']}</span></div>
        <div><span>• En cours:</span><span>{metrics['En Cours']}</span></div>
        <div><span>• Résolus:</span><span>{metrics['Résolu']}</span></div>
        <div><span>• Fermés:</span><span>{metrics['Fermé']}</span></div>
      </div>
    </div>
  );

  const DebugPanel = () => (
    <div className="debug-panel">
      <h4>🔍 Informations de Debug</h4>
      <div className="debug-grid">
        <div>📊 Tickets récupérés: {debugInfo.ticketsCount || 0}</div>
        <div> Clients récupérés: {debugInfo.clientsCount || 0}</div>
        <div> Type clients data: {debugInfo.clientsDataType || 'undefined'}</div>
        <div> Tickets traités: {debugInfo.processedTicketsCount || 0}</div>
        <div> Tickets non appariés: {debugInfo.unmatchedTicketsCount || 0}</div>
        <div> Mappings clients: {debugInfo.clientMappingCount || 0}</div>
        <div>📈 Points de données: {debugInfo.chartDataLength || 0}</div>
      </div>
      {debugInfo.sampleTicket && (
        <details className="debug-details">
          <summary>Exemple de ticket</summary>
          <pre>{JSON.stringify(debugInfo.sampleTicket, null, 2)}</pre>
        </details>
      )}
      {debugInfo.sampleClient && (
        <details className="debug-details">
          <summary>Exemple de client</summary>
          <pre>{JSON.stringify(debugInfo.sampleClient, null, 2)}</pre>
        </details>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        Chargement des données...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div className="error-container">
          <div>{error}</div>
          <button className="retry-button" onClick={fetchData}>
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
        <div className="no-data-container">
          <div>❌ Aucune donnée disponible</div>
          <button className="retry-button" onClick={fetchData}>
            Recharger les données
          </button>
        </div>
        {showDebug && <DebugPanel />}
      </div>
    );
  }

  return (
    <div className="tickets-container">
      {showDebug && <DebugPanel />}

      <div className="header-controls">
        <div className="controls-group">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className={`debug-toggle ${showDebug ? 'active' : 'inactive'}`}
          >
            {showDebug ? ' Masquer Debug' : ' Debug'}
          </button>
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value)}
            className="chart-type-select"
          >
            <option value="bar"> Barres groupées</option>
            <option value="pie"> Camembert</option>
          </select>
          <button onClick={fetchData} className="refresh-button">
             Actualiser
          </button>
        </div>
      </div>

      <div className="client-metrics-section">
        <h3>📈 Résumé par Client</h3>
        <div className="client-metrics-container">
          <div className="client-metrics-wrapper">
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
      </div>

      <div className="main-content">
        <div className="chart-container">
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
                  domain={[0, 'dataMax + 1']}
                  allowDecimals={false}
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

        <div className="table-container">
          <h3> Données Détaillées</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Ouvert</th>
                  <th>En Cours</th>
                  <th>Résolu</th>
                  <th>Fermé</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(clientMetrics)
                  .sort(([,a], [,b]) => b.total - a.total)
                  .map(([clientName, metrics]) => (
                    <tr key={clientName}>
                      <td title={clientName}>{clientName}</td>
                      <td>{metrics['Ouvert']}</td>
                      <td>{metrics['En Cours']}</td>
                      <td>{metrics['Résolu']}</td>
                      <td>{metrics['Fermé']}</td>
                      <td>{metrics.total}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketsClientChart;