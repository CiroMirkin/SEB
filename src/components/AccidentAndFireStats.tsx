import React from 'react';

interface EventCounts {
  [key: string]: number;
}

interface MonthlyData {
  month: number;
  accidentsByType: EventCounts;
  firesByType: EventCounts;
}

interface Props {
  data: {
    year: string;
    monthlyCounts: MonthlyData[];
  };
}

const AccidentAndFireStats: React.FC<Props> = ({ data }) => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getTotalEvents = (events: EventCounts): number => {
    return Object.values(events).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Estadísticas de Accidentes e Incendios - Año {data.year}</h2>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {data.monthlyCounts.map((monthData) => (
          <div 
            key={monthData.month}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: '#f9f9f9'
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
              {monthNames[monthData.month - 1]}
            </h3>
            
            <div style={{ display: 'flex', gap: '30px' }}>
              {/* Accidentes */}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#d32f2f' }}>
                  Accidentes ({getTotalEvents(monthData.accidentsByType)})
                </h4>
                {Object.keys(monthData.accidentsByType).length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(monthData.accidentsByType).map(([type, count]) => (
                      <span 
                        key={type}
                        style={{
                          backgroundColor: '#ffebee',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        {type}: {count}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#999', fontStyle: 'italic' }}>Sin accidentes</span>
                )}
              </div>

              {/* Incendios */}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#f57c00' }}>
                  Incendios ({getTotalEvents(monthData.firesByType)})
                </h4>
                {Object.keys(monthData.firesByType).length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(monthData.firesByType).map(([type, count]) => (
                      <span 
                        key={type}
                        style={{
                          backgroundColor: '#fff3e0',
                          padding: '4px 8px',   
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        {type}: {count}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#999', fontStyle: 'italic' }}>Sin incendios</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccidentAndFireStats;