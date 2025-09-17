// Función para calcular la media (promedio) mensual por año
export function getYearlyAverages(accidentsAndFires: any[]) {
  return accidentsAndFires.map(anual => {
    const totalAccidents = anual.byMonth.reduce((sum: number, month: any) => 
      sum + month.accidents.length, 0)
    
    const totalFires = anual.byMonth.reduce((sum: number, month: any) => 
      sum + month.fires.length, 0)
    
    const numberOfMonths = anual.byMonth.length
    
    return {
      year: anual.year,
      averages: {
        accidents: numberOfMonths > 0 ? totalAccidents / numberOfMonths : 0,
        fires: numberOfMonths > 0 ? totalFires / numberOfMonths : 0
      },
      totalMonths: numberOfMonths,
      totals: {
        accidents: totalAccidents,
        fires: totalFires
      }
    }
  })
}

// Función auxiliar para calcular la moda (valor más frecuente)
function calculateMode(values: number[]): number[] {
  if (values.length === 0) return []
  
  // Contar frecuencias
  const frequency: { [key: number]: number } = {}
  values.forEach(value => {
    frequency[value] = (frequency[value] || 0) + 1
  })
  
  // Encontrar la frecuencia máxima
  const maxFrequency = Math.max(...Object.values(frequency))
  
  // Obtener todos los valores con frecuencia máxima
  const modes = Object.keys(frequency)
    .filter(key => frequency[Number(key)] === maxFrequency)
    .map(Number)
  
  return modes.sort((a, b) => a - b)
}

// Función para encontrar máximos y mínimos con información del mes
function findExtremesWithMonth(monthlyData: any[], valueKey: string) {
  if (monthlyData.length === 0) {
    return {
      max: { value: 0, month: '', monthIndex: -1 },
      min: { value: 0, month: '', monthIndex: -1 }
    }
  }

  let max = { value: -Infinity, month: '', monthIndex: -1 };
  let min = { value: Infinity, month: '', monthIndex: -1 };

  const monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  monthlyData.forEach((month, index) => {
    const value = month[valueKey].length;
    if (value > max.value) {
      max = { value, month: monthNames[index], monthIndex: index };
    }
    if (value < min.value) {
      min = { value, month: monthNames[index], monthIndex: index };
    }
  });

  return { max, min };
}

// Función para calcular la moda mensual por año
export function getYearlyModes(accidentsAndFires: any[]) {
  return accidentsAndFires.map(anual => {
    // Extraer valores mensuales
    const monthlyAccidents = anual.byMonth.map((month: any) => month.accidents.length)
    const monthlyFires = anual.byMonth.map((month: any) => month.fires.length)
    
    return {
      year: anual.year,
      modes: {
        accidents: calculateMode(monthlyAccidents),
        fires: calculateMode(monthlyFires)
      },
      monthlyValues: {
        accidents: monthlyAccidents,
        fires: monthlyFires
      }
    }
  })
}

// Función combinada que calcula tanto media como moda, máximos y mínimos
export function getYearlyStatistics(accidentsAndFires: any[]) {
  return accidentsAndFires.map(anual => {
    // Extraer valores mensuales
    const monthlyAccidents = anual.byMonth.map((month: any) => month.accidents.length)
    const monthlyFires = anual.byMonth.map((month: any) => month.fires.length)
    
    const totalAccidents = monthlyAccidents.reduce((sum: any, count: any) => sum + count, 0)
    const totalFires = monthlyFires.reduce((sum: any, count: any) => sum + count, 0)
    const numberOfMonths = anual.byMonth.length

    // Encontrar máximos y mínimos con información del mes
    const accidentsExtremes = findExtremesWithMonth(anual.byMonth, 'accidents')
    const firesExtremes = findExtremesWithMonth(anual.byMonth, 'fires')

    return {
      year: anual.year,
      statistics: {
        accidents: {
          average: numberOfMonths > 0 ? totalAccidents / numberOfMonths : 0,
          mode: calculateMode(monthlyAccidents),
          total: totalAccidents,
          monthlyValues: monthlyAccidents,
          max: accidentsExtremes.max,
          min: accidentsExtremes.min
        },
        fires: {
          average: numberOfMonths > 0 ? totalFires / numberOfMonths : 0,
          mode: calculateMode(monthlyFires),
          total: totalFires,
          monthlyValues: monthlyFires,
          max: firesExtremes.max,
          min: firesExtremes.min
        }
      },
      totalMonths: numberOfMonths
    }
  })
}

// Función para obtener estadísticas resumidas (solo números principales)
export function getYearlyStatisticsSummary(accidentsAndFires: any[]) {
  const stats = getYearlyStatistics(accidentsAndFires)
  
  return stats.map(anual => ({
    year: anual.year,
    accidents: {
      average: Math.round(anual.statistics.accidents.average * 100) / 100,
      mode: anual.statistics.accidents.mode.length === 1 
        ? anual.statistics.accidents.mode[0] 
        : anual.statistics.accidents.mode,
      total: anual.statistics.accidents.total,
      max: {
        value: anual.statistics.accidents.max.value,
        month: anual.statistics.accidents.max.month,
        monthIndex: anual.statistics.accidents.max.monthIndex
      },
      min: {
        value: anual.statistics.accidents.min.value,
        month: anual.statistics.accidents.min.month,
        monthIndex: anual.statistics.accidents.min.monthIndex
      }
    },
    fires: {
      average: Math.round(anual.statistics.fires.average * 100) / 100,
      mode: anual.statistics.fires.mode.length === 1 
        ? anual.statistics.fires.mode[0] 
        : anual.statistics.fires.mode,
      total: anual.statistics.fires.total,
      max: {
        value: anual.statistics.fires.max.value,
        month: anual.statistics.fires.max.month,
        monthIndex: anual.statistics.fires.max.monthIndex
      },
      min: {
        value: anual.statistics.fires.min.value,
        month: anual.statistics.fires.min.month,
        monthIndex: anual.statistics.fires.min.monthIndex
      }
    }
  }))
}

// Ejemplo de resultado de getYearlyStatisticsSummary:
// [
//   {
//     year: 2024,
//     accidents: {
//       average: 12.5,                    // promedio mensual
//       mode: 10,                         // valor más frecuente por mes
//       total: 150,                       // total anual
//       max: {
//         value: 25,                      // cantidad máxima
//         month: "Enero",                 // nombre del mes
//         monthIndex: 0                   // índice del mes (0-based)
//       },
//       min: {
//         value: 5,
//         month: "Diciembre",
//         monthIndex: 11
//       }
//     },
//     fires: {
//       average: 3.75,
//       mode: [2, 4],                     // si hay múltiples modas
//       total: 45,
//       max: {
//         value: 8,
//         month: "Julio",
//         monthIndex: 6
//       },
//       min: {
//         value: 1,
//         month: "Febrero",
//         monthIndex: 1
//       }
//     }
//   }
// ]

// Ejemplos de uso:
// const promedios = getYearlyAverages(accidentsAndFires)
// const modas = getYearlyModes(accidentsAndFires)
// const estadisticas = getYearlyStatistics(accidentsAndFires)
// const resumen = getYearlyStatisticsSummary(accidentsAndFires)