import React, { useState, useEffect } from 'react';

const ProductionLineChart = ({ apiUrl = 'http://localhost:5000/api' }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // Couleurs pour les différentes lignes de production
  const lineColors = {
    'Line A': '#3b82f6',  // Bleu
    'Line B': '#10b981',  // Vert
    'Line C': '#f59e0b',  // Orange
    'Line D': '#ef4444',  // Rouge
    'Line E': '#8b5cf6',  // Violet
    'Line F': '#06b6d4',  // Cyan
    'Line G': '#f97316',  // Orange foncé
    'Line H': '#ec4899',  // Rose
    'Line I': '#84cc16',  // Lime
    'Line J': '#6366f1'   // Indigo
  };

  const fetchProductionData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}/production-lines`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      
      processChartData(data);

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      // Données de test pour la démo
      const mockData = [
        {
          id: 1,
          name: 'Line A',
          production: 1250,
          efficiency: 85,
          status: 'active',
          products: ['Product X', 'Product Y'],
          lastMaintenance: '2024-12-01',
          nextMaintenance: '2024-12-15'
        },
        {
          id: 2,
          name: 'Line B',
          production: 950,
          efficiency: 92,
          status: 'active',
          products: ['Product Z'],
          lastMaintenance: '2024-11-28',
          nextMaintenance: '2024-12-12'
        },
        {
          id: 3,
          name: 'Line C',
          production: 800,
          efficiency: 78,
          status: 'maintenance',
          products: ['Product A', 'Product B'],
          lastMaintenance: '2024-12-03',
          nextMaintenance: '2024-12-17'
        },
        {
          id: 4,
          name: 'Line D',
          production: 1100,
          efficiency: 88,
          status: 'active',
          products: ['Product C'],
          lastMaintenance: '2024-11-25',
          nextMaintenance: '2024-12-09'
        },
        {
          id: 5,
          name: 'Line E',
          production: 650,
          efficiency: 82,
          status: 'inactive',
          products: ['Product D', 'Product E'],
          lastMaintenance: '2024-11-30',
          nextMaintenance: '2024-12-14'
        }
      ];
      processChartData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data) => {
    console.log('📊 Données de production reçues:', data);
    
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }

    // Calculer le total de production
    const totalProduction = data.reduce((sum, line) => sum + line.production, 0);
    
    // Traiter les données pour le graphique
    const processedData = data.map((line, index) => {
      const percentage = totalProduction > 0 ? (line.production / totalProduction) * 100 : 0;
      const color = lineColors[line.name] || `hsl(${index * 360 / data.length}, 70%, 50%)`;
      
      return {
        ...line,
        percentage: percentage,
        color: color,
        formattedProduction: line.production.toLocaleString()
      };
    });

    console.log('📈 Données traitées:', processedData);
    setChartData(processedData);
  };

  // Créer les segments du graphique en anneau
  const createDonutSegments = () => {
    if (chartData.length === 0) return [];

    let cumulativePercentage = 0;
    const radius = 120;
    const innerRadius = 80;
    const centerX = 150;
    const centerY = 150;

    return chartData.map((line, index) => {
      const startAngle = (cumulativePercentage / 100) * 360;
      const endAngle = ((cumulativePercentage + line.percentage) / 100) * 360;
      
      // Convertir les angles en radians
      const startRadian = (startAngle - 90) * (Math.PI / 180);
      const endRadian = (endAngle - 90) * (Math.PI / 180);
      
      // Calculer les points du segment
      const largeArcFlag = line.percentage > 50 ? 1 : 0;
      
      const x1 = centerX + radius * Math.cos(startRadian);
      const y1 = centerY + radius * Math.sin(startRadian);
      const x2 = centerX + radius * Math.cos(endRadian);
      const y2 = centerY + radius * Math.sin(endRadian);
      
      const x3 = centerX + innerRadius * Math.cos(endRadian);
      const y3 = centerY + innerRadius * Math.sin(endRadian);
      const x4 = centerX + innerRadius * Math.cos(startRadian);
      const y4 = centerY + innerRadius * Math.sin(startRadian);
      
      const pathData = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
        Z
      `;

      // Position pour le label
      const labelAngle = (startAngle + endAngle) / 2 - 90;
      const labelRadius = (radius + innerRadius) / 2;
      const labelX = centerX + labelRadius * Math.cos(labelAngle * (Math.PI / 180));
      const labelY = centerY + labelRadius * Math.sin(labelAngle * (Math.PI / 180));

      cumulativePercentage += line.percentage;

      return {
        path: pathData,
        color: line.color,
        line: line,
        labelX: labelX,
        labelY: labelY,
        index: index
      };
    });
  };

  const handleSegmentClick = (line) => {
    setSelectedLine(line);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': '#10b981',
      'maintenance': '#f59e0b',
      'inactive': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Actif',
      'maintenance': 'Maintenance',
      'inactive': 'Inactif'
    };
    return labels[status] || status;
  };

  // Modal pour afficher les détails d'une ligne
  const LineDetailsModal = () => {
    if (!showModal || !selectedLine) return null;

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
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80%',
          overflow: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '2px solid #f3f4f6',
            paddingBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: selectedLine.color,
                borderRadius: '4px'
              }} />
              <h3 style={{ margin: 0, color: '#111827', fontSize: '20px' }}>
                {selectedLine.name}
              </h3>
            </div>
            <button 
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onClick={() => setShowModal(false)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Statistiques principales */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Production</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
                  {selectedLine.formattedProduction}
                </div>
                <div style={{ fontSize: '11px', color: selectedLine.color }}>
                  {selectedLine.percentage.toFixed(1)}% du total
                </div>
              </div>
              
              <div style={{
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Efficacité</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
                  {selectedLine.efficiency}%
                </div>
                <div style={{
                  fontSize: '11px',
                  color: selectedLine.efficiency >= 90 ? '#10b981' : selectedLine.efficiency >= 80 ? '#f59e0b' : '#ef4444'
                }}>
                  {selectedLine.efficiency >= 90 ? 'Excellent' : selectedLine.efficiency >= 80 ? 'Bon' : 'À améliorer'}
                </div>
              </div>
            </div>

            {/* Statut */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Statut</div>
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  backgroundColor: getStatusColor(selectedLine.status),
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '500'
                }}>
                  {getStatusLabel(selectedLine.status)}
                </div>
              </div>
            </div>

            {/* Produits */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Produits</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedLine.products.map((product, index) => (
                  <span key={index} style={{
                    padding: '4px 8px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#475569'
                  }}>
                    {product}
                  </span>
                ))}
              </div>
            </div>

            {/* Maintenance */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: '#fef3c7',
                borderRadius: '6px',
                border: '1px solid #fbbf24'
              }}>
                <div style={{ fontSize: '11px', color: '#92400e', marginBottom: '4px' }}>Dernière maintenance</div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#92400e' }}>
                  {new Date(selectedLine.lastMaintenance).toLocaleDateString('fr-FR')}
                </div>
              </div>
              
              <div style={{
                padding: '12px',
                backgroundColor: '#dcfce7',
                borderRadius: '6px',
                border: '1px solid #22c55e'
              }}>
                <div style={{ fontSize: '11px', color: '#15803d', marginBottom: '4px' }}>Prochaine maintenance</div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#15803d' }}>
                  {new Date(selectedLine.nextMaintenance).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchProductionData();
  }, []);

  if (loading) return (
    <div style={{ 
      textAlign: 'center', 
      padding: '40px',
      fontSize: '14px',
      color: '#6b7280'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e5e7eb',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 12px'
      }} />
      Chargement des données de production...
    </div>
  );
  
  if (error) return (
    <div style={{ 
      color: '#ef4444', 
      textAlign: 'center', 
      padding: '20px',
      backgroundColor: '#fef2f2',
      borderRadius: '8px',
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
        padding: '40px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h4 style={{ color: '#6b7280', margin: '0 0 8px 0', fontSize: '16px' }}>Aucune donnée disponible</h4>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          Configurez vos lignes de production pour voir la distribution
        </p>
      </div>
    );
  }

  const segments = createDonutSegments();
  const totalProduction = chartData.reduce((sum, line) => sum + line.production, 0);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '20px', fontWeight: '600' }}>
            Production Line Distribution
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Distribution de la production par ligne
          </p>
        </div>
        <button 
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onClick={fetchProductionData}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Actualiser
        </button>
      </div>
      
      {/* Graphique principal */}
      <div style={{ 
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {/* Graphique en anneau */}
        <div style={{ position: 'relative' }}>
          <svg width="300" height="300" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>
            {segments.map((segment, index) => (
              <g key={index}>
                <path
                  d={segment.path}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="2"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: hoveredSegment === index ? 0.8 : 1,
                    transform: hoveredSegment === index ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: '150px 150px'
                  }}
                  onClick={() => handleSegmentClick(segment.line)}
                  onMouseEnter={() => setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
                
                {/* Labels sur les segments */}
                {segment.line.percentage > 8 && (
                  <text
                    x={segment.labelX}
                    y={segment.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    pointerEvents="none"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {segment.line.name.replace('Line ', '')}
                  </text>
                )}
              </g>
            ))}
          </svg>
          
          {/* Centre du graphique */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '50%',
            width: '140px',
            height: '140px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '4px'
            }}>
              {totalProduction.toLocaleString()}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              TOTAL
            </div>
            <div style={{
              fontSize: '10px',
              color: '#9ca3af',
              marginTop: '2px'
            }}>
              Production
            </div>
          </div>
        </div>
        
        {/* Légende */}
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            color: '#374151', 
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Lignes de Production
          </h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            {chartData.map((line, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: hoveredSegment === index ? '#f8fafc' : 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: hoveredSegment === index ? '1px solid #e2e8f0' : '1px solid transparent'
                }}
                onClick={() => handleSegmentClick(line)}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: line.color,
                  borderRadius: '4px',
                  flexShrink: 0,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }} />
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      {line.name}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      {line.percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      {line.formattedProduction} unités
                    </span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        backgroundColor: getStatusColor(line.status),
                        borderRadius: '50%'
                      }} />
                      <span style={{
                        fontSize: '10px',
                        color: '#6b7280'
                      }}>
                        {line.efficiency}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LineDetailsModal />
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductionLineChart;