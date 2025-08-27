export const parseStatistics = () => {
    if (!data?.rawData) return null

    let records = data.rawData
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

    // Aplicar filtros
    if (selectedYear !== "all") {
      records = records.filter(record => {
        const fechaStr = record["fecha del pedido"] || ""
        if (!fechaStr) return false
        
        try {
          // Manejar diferentes formatos de fecha
          let date: Date
          if (fechaStr.includes('/')) {
            // Formato DD/MM/YYYY o MM/DD/YYYY
            const parts = fechaStr.split('/')
            if (parts.length === 3) {
              // Asumir formato DD/MM/YYYY que es común en Argentina
              const day = parseInt(parts[0])
              const month = parseInt(parts[1]) - 1 // Los meses en JavaScript son 0-11
              const year = parseInt(parts[2])
              date = new Date(year, month, day)
            } else {
              date = new Date(fechaStr)
            }
          } else {
            date = new Date(fechaStr)
          }
          
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear().toString()
            return year === selectedYear
          }
        } catch (e) {
          console.warn(`Error parsing date: ${fechaStr}`)
        }
        return false
      })
    }

    if (selectedMonth !== "all") {
      records = records.filter(record => {
        const fechaStr = record["fecha del pedido"] || ""
        if (!fechaStr) return false
        
        try {
          // Manejar diferentes formatos de fecha
          let date: Date
          if (fechaStr.includes('/')) {
            const parts = fechaStr.split('/')
            if (parts.length === 3) {
              const day = parseInt(parts[0])
              const month = parseInt(parts[1]) - 1
              const year = parseInt(parts[2])
              date = new Date(year, month, day)
            } else {
              date = new Date(fechaStr)
            }
          } else {
            date = new Date(fechaStr)
          }
          
          if (!isNaN(date.getTime())) {
            const month = monthNames[date.getMonth()]
            return month === selectedMonth
          }
        } catch (e) {
          console.warn(`Error parsing date: ${fechaStr}`)
        }
        return false
      })
    }

    if (selectedLocation !== "all") {
      records = records.filter(record => 
        (record["Localidad"] || "Desconocido") === selectedLocation
      )
    }

    // Procesar datos filtrados
    const monthlyStats: { [key: string]: { fires: number; accidents: number; total: number; transfers: number; units: number[] } } = {}
    const locationStats: { [key: string]: number } = {}
    const serviceTypeStats: { [key: string]: number } = {}
    const transferStats: { [key: string]: number } = {}
    const codigoServicioStats: { [key: string]: number } = {}
    const unitStats: { [key: string]: number[] } = {}
    const yearsSet = new Set<string>()
    let totalUnits = 0
    let unitCount = 0
    let totalTransfers = 0
    let totalCalls = 0

    records.forEach((record, index) => {
      // Extraer mes y año
      const fechaStr = record["fecha del pedido"] || ""
      let month = "Unknown"
      let year = "Unknown"
      
      if (fechaStr) {
        try {
          // Manejar diferentes formatos de fecha
          let date: Date
          if (fechaStr.includes('/')) {
            const parts = fechaStr.split('/')
            if (parts.length === 3) {
              const day = parseInt(parts[0])
              const monthNum = parseInt(parts[1]) - 1
              const yearNum = parseInt(parts[2])
              date = new Date(yearNum, monthNum, day)
            } else {
              date = new Date(fechaStr)
            }
          } else {
            date = new Date(fechaStr)
          }
          
          if (!isNaN(date.getTime())) {
            month = monthNames[date.getMonth()]
            year = date.getFullYear().toString()
            yearsSet.add(year)
          }
        } catch (e) {
          console.warn(`Error parsing date: ${fechaStr}`)
        }
      }

      // Inicializar estadísticas mensuales
      if (!monthlyStats[month]) {
        monthlyStats[month] = { fires: 0, accidents: 0, total: 0, transfers: 0, units: [] }
      }

      // Contar por tipo de servicio - Lógica mejorada
      const tipoServicio = (record["Tipo de Servicio"] || "").toLowerCase()
      const codigoServicio = (record["Código de Servicio"] || "").toString()
      const descripcion = (record["Descripción"] || "").toLowerCase()
      
      // Clasificación mejorada de incendios
      const isIncendio = tipoServicio.includes("incendio") || 
                        tipoServicio.includes("forestal") ||
                        tipoServicio.includes("vivienda") ||
                        tipoServicio.includes("vehicular") ||
                        descripcion.includes("incendio") ||
                        descripcion.includes("fuego") ||
                        descripcion.includes("quema") ||
                        codigoServicio.startsWith("1")
      
      // Clasificación mejorada de accidentes
      const isAccidente = tipoServicio.includes("accidente") || 
                         tipoServicio.includes("transito") ||
                         tipoServicio.includes("rescate") ||
                         tipoServicio.includes("ambulancia") ||
                         descripcion.includes("accidente") ||
                         descripcion.includes("colisión") ||
                         descripcion.includes("choque") ||
                         descripcion.includes("atropello") ||
                         codigoServicio.startsWith("2") ||
                         codigoServicio.startsWith("3")
      
      if (isIncendio) {
        monthlyStats[month].fires++
      } else if (isAccidente) {
        monthlyStats[month].accidents++
      }
      monthlyStats[month].total++
      totalCalls++ // Contar total de llamadas

      // Estadísticas por localidad
      const localidad = record["Localidad"] || "Desconocido"
      locationStats[localidad] = (locationStats[localidad] || 0) + 1

      // Estadísticas por tipo de servicio
      serviceTypeStats[tipoServicio] = (serviceTypeStats[tipoServicio] || 0) + 1

      // Estadísticas por código de servicio
      if (codigoServicio && codigoServicio !== "0") {
        codigoServicioStats[codigoServicio] = (codigoServicioStats[codigoServicio] || 0) + 1
      }

      // Estadísticas de traslados - Lógica mejorada
      const traslado = (record["SE REALIZO EL TRASLADO"] || "").toString().toLowerCase()
      
      // Verificar si se realizó traslado (múltiples formas en que puede aparecer)
      const seRealizoTraslado = traslado.includes("si") || 
                               traslado.includes("sí") ||
                               descripcion.includes("traslado") ||
                               descripcion.includes("trasladado") ||
                               descripcion.includes("hospital") ||
                               descripcion.includes("centro de salud")
      
      if (seRealizoTraslado) {
        transferStats[month] = (transferStats[month] || 0) + 1
        monthlyStats[month].transfers++
        totalTransfers++
      }

      // Estadísticas de unidades - Lógica mejorada
      let unidades = 0
      
      // Intentar obtener unidades de diferentes columnas posibles
      const unidadesStr1 = record["CANTIDAD DE UNIDAD INTERVENIENTES"] || "0"
      const unidadesStr2 = record["Personal Interviniente"] || "0"
      const movilPrincipal = (record["Móvil"] || "").toString()
      const movilInterviniente = (record["Móvil interviniente"] || "").toString()
      
      // Parsear cantidad de unidades
      unidades = parseInt(unidadesStr1) || 0
      
      // Si no hay unidades en la columna principal, intentar con otras
      if (unidades === 0) {
        unidades = parseInt(unidadesStr2) || 0
      }
      
      // Contar unidades móviles mencionadas
      if (unidades === 0 && (movilPrincipal || movilInterviniente)) {
        // Contar cuántos móviles diferentes se mencionan
        const moviles = new Set<string>()
        if (movilPrincipal && movilPrincipal !== "0") moviles.add(movilPrincipal)
        if (movilInterviniente && movilInterviniente !== "0") moviles.add(movilInterviniente)
        unidades = moviles.size
      }
      
      if (unidades > 0) {
        totalUnits += unidades
        unitCount++
        monthlyStats[month].units.push(unidades)
        if (!unitStats[month]) unitStats[month] = []
        unitStats[month].push(unidades)
      }
    })

    // Convertir a arrays para gráficos y calcular estadísticas avanzadas
    const monthlyData = Object.entries(monthlyStats).map(([month, stats]) => {
      const avgUnitsMonth = stats.units.length > 0 ? (stats.units.reduce((a, b) => a + b, 0) / stats.units.length).toFixed(1) : 0
      return {
        month,
        incendios: stats.fires,
        accidentes: stats.accidents,
        total: stats.total,
        traslados: stats.transfers,
        avgUnits: parseFloat(avgUnitsMonth)
      }
    })

    // Calcular tendencias (comparación con mes anterior)
    const trends = {
      fires: { trend: 'stable', change: 0 },
      accidents: { trend: 'stable', change: 0 },
      transfers: { trend: 'stable', change: 0 },
      units: { trend: 'stable', change: 0 },
      calls: { trend: 'stable', change: 0 }
    }

    if (monthlyData.length > 1) {
      const current = monthlyData[monthlyData.length - 1]
      const previous = monthlyData[monthlyData.length - 2]
      
      trends.fires.change = current.incendios - previous.incendios
      trends.fires.trend = trends.fires.change > 0 ? 'up' : trends.fires.change < 0 ? 'down' : 'stable'
      
      trends.accidents.change = current.accidentes - previous.accidentes
      trends.accidents.trend = trends.accidents.change > 0 ? 'up' : trends.accidents.change < 0 ? 'down' : 'stable'
      
      trends.transfers.change = current.traslados - (previous.traslados || 0)
      trends.transfers.trend = trends.transfers.change > 0 ? 'up' : trends.transfers.change < 0 ? 'down' : 'stable'
      
      trends.units.change = current.avgUnits - previous.avgUnits
      trends.units.trend = trends.units.change > 0 ? 'up' : trends.units.change < 0 ? 'down' : 'stable'
      
      trends.calls.change = current.total - previous.total
      trends.calls.trend = trends.calls.change > 0 ? 'up' : trends.calls.change < 0 ? 'down' : 'stable'
    }

    const locationData = Object.entries(locationStats)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 localidades

    const serviceTypeData = Object.entries(serviceTypeStats)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8) // Top 8 tipos de servicio

    const codigoServicioData = Object.entries(codigoServicioStats)
      .map(([codigo, count]) => ({ codigo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 códigos de servicio

    const transferData = Object.entries(transferStats).map(([month, count]) => ({
      month,
      traslados: count
    }))

    // Estadísticas de unidades por mes
    const unitsByMonthData = Object.entries(unitStats).map(([month, units]) => {
      const avgUnits = units.length > 0 ? (units.reduce((a, b) => a + b, 0) / units.length).toFixed(1) : 0
      const totalUnits = units.reduce((a, b) => a + b, 0)
      return {
        month,
        avgUnits: parseFloat(avgUnits),
        totalUnits,
        count: units.length
      }
    })

    const avgUnits = unitCount > 0 ? (totalUnits / unitCount).toFixed(1) : 0
    const transferRate = totalCalls > 0 ? ((totalTransfers / totalCalls) * 100).toFixed(1) : 0

    return {
      monthlyData,
      locationData,
      serviceTypeData,
      codigoServicioData,
      transferData,
      unitsByMonthData,
      avgUnits,
      transferRate,
      totalCalls,
      totalTransfers,
      totalRecords: records.length,
      totalLocations: Object.keys(locationStats).length,
      filteredRecords: records.length,
      originalRecords: data.rawData.length,
      availableYears: Array.from(yearsSet).sort(),
      trends
    }
  }