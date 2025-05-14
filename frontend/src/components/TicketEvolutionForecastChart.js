import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import _ from 'lodash';

// Fonction personnalisée de polyfit utilisant mathjs
const polyfit = (x, y, degree) => {
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
};

const TicketEvolutionForecastChart = ({ 
  tickets = [], 
  fetchUrl 
}) => {
  const [ticketsState, setTickets] = useState(tickets);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fonction pour formater la date de manière lisible
  const formatDateLabel = (date) => {
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return `${dayNames[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Formatage des dates pour comparer les tickets par jour
  const formatDateForCompare = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  // Fonction pour générer une plage de dates
  const generateDateRange = (startDate, days) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });
  };

  // Générer les données du graphique à partir des tickets réels
  const generateTicketEvolutionData = (ticketsData) => {
    if (!Array.isArray(ticketsData) || ticketsData.length === 0) {
      setChartData([]);
      return;
    }
    
    // Journal pour le débogage
    console.log("Génération des données du graphique avec", ticketsData.length, "tickets");
    
    // S'assurer que toutes les dates sont des objets Date
    const validTickets = ticketsData.filter(ticket => ticket && ticket.createdAt);
    
    // Trouver la plage de dates des tickets
    const ticketDates = validTickets.map(ticket => new Date(ticket.createdAt));
    
    // Déterminer date min et max
    let minDate = new Date(Math.min(...ticketDates));
    minDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Générer une plage de 20 jours à partir de la date minimale
    const dateRange = generateDateRange(minDate, 20);
    
    // Grouper les tickets par jour (utiliser la date sans l'heure)
    const ticketsByDay = _.groupBy(validTickets, ticket => {
      return formatDateForCompare(ticket.createdAt);
    });

    // Créer les données du graphique
    const processedData = dateRange.map(date => {
      const dateString = formatDateForCompare(date);
      const dayTickets = ticketsByDay[dateString] || [];
      
      // Un jour est "actuel" s'il est aujourd'hui ou dans le passé
      const isActual = date <= today;
      
      return {
        day: formatDateLabel(date),
        date: date, // Conserver l'objet date pour trier plus tard
        actualTickets: isActual ? dayTickets.length : null,
        predictedTickets: !isActual ? null : null, // On remplira ça plus tard
        isActual: isActual
      };
    });
    
    // Ajouter des prédictions
    const forecastedData = forecastTickets(processedData);
    
    // S'assurer que la date d'aujourd'hui montre les données réelles
    const dataWithTodayFixed = forecastedData.map(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      
      // Si c'est aujourd'hui, on s'assure d'afficher les données réelles
      if (itemDate.getTime() === todayDate.getTime()) {
        const todayString = formatDateForCompare(todayDate);
        const todayTickets = ticketsByDay[todayString] || [];
        return {
          ...item,
          actualTickets: todayTickets.length,
          predictedTickets: null
        };
      }
      return item;
    });
    
    console.log("Données du graphique générées:", dataWithTodayFixed);
    setChartData(dataWithTodayFixed);
  };

  // Fonction de prévision utilisant une régression polynomiale
  const forecastTickets = (historicalData) => {
    // Séparer les données réelles et à prédire
    const actualData = historicalData.filter(data => data.isActual);
    const forecastData = historicalData.filter(data => !data.isActual);
    
    if (actualData.length < 2) return historicalData;

    // Préparer les données pour la régression
    const x = actualData.map((_, index) => index);
    const y = actualData.map(data => data.actualTickets || 0);

    // Calculer la régression polynomiale (degré 1 = régression linéaire)
    const regression = polyfit(x, y, 1);
    const [intercept, slope] = regression;

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

    // Combiner les données réelles et prédites
    return [
      ...actualData,
      ...forecastedPredictions
    ];
  };

  // Fetch tickets si une URL est fournie
  const fetchTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      if (fetchUrl) {
        console.log("Fetching tickets from", fetchUrl);
        const response = await axios.get(fetchUrl);
        console.log("Fetched", response.data.length, "tickets");
        setTickets(response.data);
      } else if (tickets && tickets.length > 0) {
        console.log("Using provided tickets:", tickets.length);
        setTickets(tickets);
      } else {
        // Fallback si pas de données
        console.warn("No ticket data available");
        setError('Aucune donnée de ticket disponible');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des tickets', err);
      setError('Impossible de récupérer les tickets');
      
      // Fallback si erreur
      if (tickets && tickets.length > 0) {
        setTickets(tickets);
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect pour récupérer les tickets si une URL est fournie
  useEffect(() => {
    console.log("Initial effect - Fetching tickets");
    fetchTickets();
    
    // Mettre en place un rafraîchissement périodique des données
    const refreshInterval = setInterval(() => {
      console.log("Auto-refresh tickets");
      fetchTickets();
    }, 60000); // Rafraîchir toutes les minutes
    
    return () => clearInterval(refreshInterval);
  }, [fetchUrl]);

  // Effect pour générer les données du graphique
  useEffect(() => {
    console.log("Generating chart data from", ticketsState?.length, "tickets");
    generateTicketEvolutionData(ticketsState);
  }, [ticketsState]);

  // Effect pour réagir aux changements de props
  useEffect(() => {
    console.log("Props 'tickets' changed, length:", tickets?.length);
    if (tickets && tickets.length > 0) {
      setTickets([...tickets]);
    }
  }, [tickets]);

  // Rendu du composant
  return (
    <div className="ticket-evolution-forecast-graph" style={{ width: '100%', height: 350 }}>
      {loading ? (
        <div className="loading">Chargement des données...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis 
              label={{ value: 'Nombre de tickets', angle: -90, position: 'insideLeft' }} 
              allowDecimals={false} 
              tickFormatter={(value) => Math.round(value)}
            />
            <Tooltip 
              formatter={(value, name, props) => {
                if (name === 'actualTickets') return [`${value} tickets réels`, 'Tickets réels'];
                if (name === 'predictedTickets') return [`${value} tickets prédits`, 'Tickets prédits'];
                return [value, name];
              }}
            />
            <Legend />
            <Line 
              dataKey="actualTickets" 
              name="Tickets réels" 
              stroke="#3498db" 
              strokeWidth={2}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line 
              dataKey="predictedTickets" 
              name="Tickets prédits" 
              stroke="#e74c3c" 
              strokeDasharray="5 5"
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="no-data">Aucune donnée de ticket disponible</div>
      )}
    </div>
  );
};

export default TicketEvolutionForecastChart;