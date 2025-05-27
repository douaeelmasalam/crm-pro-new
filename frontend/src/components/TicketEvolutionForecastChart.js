import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ComposedChart,
  Legend 
} from 'recharts';
import { 
  multiply, 
  transpose, 
  inv 
} from 'mathjs';
import _ from 'lodash';

// Fonction personnalisée de polyfit utilisant mathjs
const polyfit = (x, y, degree) => {
  try {
    // Créer la matrice de Vandermonde
    const V = x.map(xi => 
      Array.from({length: degree + 1}, (_, k) => Math.pow(xi, k))
    );

    // Transposer V
    const VT = transpose(V);

    // Calculer (V^T * V)^-1 * V^T * y
    const VTV = multiply(VT, V);
    const VTVinv = inv(VTV);
    const VTy = multiply(VT, y);
    
    return multiply(VTVinv, VTy);
  } catch (error) {
    console.error('Erreur dans polyfit:', error);
    // Fallback: régression linéaire simple
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return [intercept, slope];
  }
};

const TicketEvolutionForecastChart = ({ 
  tickets = [], 
  fetchUrl,
  refreshInterval = 30000 // 30 secondes par défaut
}) => {
  const [ticketsState, setTickets] = useState(tickets);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  // Fonction pour formater la date de manière lisible
  const formatDateLabel = (date) => {
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return `${dayNames[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Formatage des dates pour comparer les tickets par jour
  const formatDateForCompare = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Fonction pour générer une plage de dates
  const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  // Générer les données du graphique à partir des tickets réels
  const generateTicketEvolutionData = useCallback((ticketsData) => {
    if (!Array.isArray(ticketsData) || ticketsData.length === 0) {
      console.log("Aucun ticket disponible pour générer le graphique");
      setChartData([]);
      return;
    }
    
    console.log("Génération des données du graphique avec", ticketsData.length, "tickets");
    
    // S'assurer que toutes les dates sont des objets Date valides
    const validTickets = ticketsData.filter(ticket => {
      return ticket && ticket.createdAt && !isNaN(new Date(ticket.createdAt).getTime());
    });
    
    console.log("Tickets valides:", validTickets.length);
    
    if (validTickets.length === 0) {
      setChartData([]);
      return;
    }
    
    // Trouver la plage de dates des tickets
    const ticketDates = validTickets.map(ticket => new Date(ticket.createdAt));
    
    // Déterminer date min et max
    let minDate = new Date(Math.min(...ticketDates));
    minDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Étendre la plage pour inclure quelques jours futurs pour la prévision
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7); // 7 jours dans le futur
    
    // Générer la plage de dates complète
    const dateRange = generateDateRange(minDate, maxDate);
    
    console.log("Plage de dates:", minDate, "à", maxDate, "total:", dateRange.length, "jours");
    
    // Grouper les tickets par jour (utiliser la date sans l'heure)
    const ticketsByDay = _.groupBy(validTickets, ticket => {
      return formatDateForCompare(ticket.createdAt);
    });

    console.log("Tickets groupés par jour:", Object.keys(ticketsByDay).length, "jours avec des tickets");

    // Créer les données du graphique
    const processedData = dateRange.map(date => {
      const dateString = formatDateForCompare(date);
      const dayTickets = ticketsByDay[dateString] || [];
      
      // Un jour est "actuel" s'il est aujourd'hui ou dans le passé
      const isActual = date <= today;
      
      return {
        day: formatDateLabel(date),
        date: date, // Conserver l'objet date pour trier plus tard
        dateString: dateString, // Pour le debug
        actualTickets: isActual ? dayTickets.length : null,
        predictedTickets: null, // On remplira ça plus tard
        isActual: isActual,
        ticketCount: dayTickets.length // Pour le debug
      };
    });
    
    console.log("Données avant prévision:", processedData.filter(d => d.isActual).map(d => ({
      day: d.day,
      actualTickets: d.actualTickets,
      ticketCount: d.ticketCount
    })));
    
    // Ajouter des prédictions
    const forecastedData = forecastTickets(processedData);
    
    console.log("Données finales du graphique:", forecastedData);
    setChartData(forecastedData);
  }, []);

  // Fonction de prévision utilisant une régression polynomiale
  const forecastTickets = (historicalData) => {
    // Séparer les données réelles et à prédire
    const actualData = historicalData.filter(data => data.isActual);
    const forecastData = historicalData.filter(data => !data.isActual);
    
    console.log("Données réelles pour prévision:", actualData.length);
    console.log("Jours à prédire:", forecastData.length);
    
    if (actualData.length < 2) {
      console.log("Pas assez de données pour faire une prévision");
      return historicalData;
    }

    // Préparer les données pour la régression
    const x = actualData.map((_, index) => index);
    const y = actualData.map(data => data.actualTickets || 0);

    console.log("Données X:", x);
    console.log("Données Y:", y);

    // Calculer la régression polynomiale (degré 1 = régression linéaire)
    const regression = polyfit(x, y, 1);
    const [intercept, slope] = regression;

    console.log("Régression - intercept:", intercept, "slope:", slope);

    // Générer des prédictions pour les jours futurs
    const forecastedPredictions = forecastData.map((data, index) => {
      // Prédire le nombre de tickets en utilisant l'équation de la ligne de régression
      const predictedTickets = Math.max(0, Math.round(slope * (actualData.length + index) + intercept));
      
      return {
        ...data,
        predictedTickets,
        actualTickets: null
      };
    });

    console.log("Prédictions générées:", forecastedPredictions.map(p => ({
      day: p.day,
      predictedTickets: p.predictedTickets
    })));

    // Combiner les données réelles et prédites
    return [
      ...actualData,
      ...forecastedPredictions
    ];
  };

  // Fetch tickets si une URL est fournie
  const fetchTickets = useCallback(async () => {
    if (!fetchUrl && (!tickets || tickets.length === 0)) {
      console.log("Aucune URL de fetch ni tickets fournis");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (fetchUrl) {
        console.log("Fetching tickets from", fetchUrl);
        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched", data.length, "tickets");
        setTickets(data);
        setLastFetchTime(new Date());
      } else if (tickets && tickets.length > 0) {
        console.log("Using provided tickets:", tickets.length);
        setTickets([...tickets]); // Créer une nouvelle référence pour forcer la mise à jour
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des tickets', err);
      setError('Impossible de récupérer les tickets: ' + err.message);
      
      // Fallback si erreur et tickets fournis
      if (tickets && tickets.length > 0) {
        setTickets([...tickets]);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchUrl, tickets]);

  // Effect pour récupérer les tickets initialement
  useEffect(() => {
    console.log("Initial effect - Fetching tickets");
    fetchTickets();
  }, [fetchTickets]);

  // Effect pour mettre en place le rafraîchissement automatique
  useEffect(() => {
    if (!fetchUrl) return;

    console.log("Setting up auto-refresh with interval:", refreshInterval);
    const refreshIntervalId = setInterval(() => {
      console.log("Auto-refresh tickets");
      fetchTickets();
    }, refreshInterval);
    
    return () => {
      console.log("Clearing auto-refresh interval");
      clearInterval(refreshIntervalId);
    };
  }, [fetchUrl, refreshInterval, fetchTickets]);

  // Effect pour générer les données du graphique
  useEffect(() => {
    console.log("Generating chart data from", ticketsState?.length, "tickets");
    generateTicketEvolutionData(ticketsState);
  }, [ticketsState, generateTicketEvolutionData]);

  // Effect pour réagir aux changements de props tickets
  useEffect(() => {
    console.log("Props 'tickets' changed, length:", tickets?.length);
    if (tickets && tickets.length > 0 && !fetchUrl) {
      // Seulement si on n'utilise pas fetchUrl
      setTickets([...tickets]);
    }
  }, [tickets, fetchUrl]);

  // Fonction pour forcer le rafraîchissement
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    fetchTickets();
  };

  // Rendu du composant
  return (
    <div className="ticket-evolution-forecast-graph" style={{ width: '100%', height: 400 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '10px',
        padding: '0 10px'
      }}>
        <h3></h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lastFetchTime && (
            <span style={{ fontSize: '12px', color: '#666' }}>
              Dernière MAJ: {lastFetchTime.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={handleRefresh}
            disabled={loading}
            style={{
              padding: '5px 10px',
              fontSize: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>
      </div>
      
      {loading && chartData.length === 0 ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px',
          color: '#666'
        }}>
          Chargement des données...
        </div>
      ) : error && chartData.length === 0 ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px',
          color: '#d32f2f'
        }}>
          {error}
        </div>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              label={{ value: 'Nombre de tickets', angle: -90, position: 'insideLeft' }} 
              allowDecimals={false} 
              tickFormatter={(value) => Math.round(value)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value, name, props) => {
                if (name === 'actualTickets') return [`${value} tickets`, 'Tickets réels'];
                if (name === 'predictedTickets') return [`${value} tickets`, 'Tickets prédits'];
                return [value, name];
              }}
              labelFormatter={(label) => `Jour: ${label}`}
            />
            <Legend />
            <Line 
              dataKey="actualTickets" 
              name="Tickets réels" 
              stroke="#2196f3" 
              strokeWidth={3}
              dot={{ r: 6, fill: '#2196f3' }}
              activeDot={{ r: 8, stroke: '#2196f3', strokeWidth: 2, fill: '#fff' }}
              connectNulls={false}
            />
            <Line 
              dataKey="predictedTickets" 
              name="Tickets prédits" 
              stroke="#ff5722" 
              strokeDasharray="8 4"
              strokeWidth={2}
              dot={{ r: 4, fill: '#ff5722' }}
              activeDot={{ r: 6, stroke: '#ff5722', strokeWidth: 2, fill: '#fff' }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px',
          color: '#666'
        }}>
          Aucune donnée de ticket disponible
        </div>
      )}
    </div>
  );
};

export default TicketEvolutionForecastChart;