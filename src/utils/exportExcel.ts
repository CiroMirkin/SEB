import type { Statistics } from "@/components/types"
import * as XLSX from "xlsx"

export const exportToExcel = (statistics: Statistics) => {
    if (!statistics) return

    const wb = XLSX.utils.book_new()

    // Hoja de resumen mensual
    const monthlyWs = XLSX.utils.json_to_sheet(statistics.monthlyData)
    XLSX.utils.book_append_sheet(wb, monthlyWs, "Resumen Mensual")

    // Hoja de localidades
    const locationWs = XLSX.utils.json_to_sheet(statistics.locationData)
    XLSX.utils.book_append_sheet(wb, locationWs, "Localidades")

    // Hoja de tipos de servicio
    const serviceTypeWs = XLSX.utils.json_to_sheet(statistics.serviceTypeData)
    XLSX.utils.book_append_sheet(wb, serviceTypeWs, "Tipos de Servicio")

    // Hoja de códigos de servicio
    const codigoServicioWs = XLSX.utils.json_to_sheet(statistics.codigoServicioData)
    XLSX.utils.book_append_sheet(wb, codigoServicioWs, "Códigos de Servicio")

    // Hoja de unidades por mes
    const unitsByMonthWs = XLSX.utils.json_to_sheet(statistics.unitsByMonthData)
    XLSX.utils.book_append_sheet(wb, unitsByMonthWs, "Unidades por Mes")

    // Hoja de traslados
    const transferWs = XLSX.utils.json_to_sheet(statistics.transferData)
    XLSX.utils.book_append_sheet(wb, transferWs, "Traslados")

    // Hoja de resumen con tendencias
    const summaryData = [
      { Parámetro: 'Total de Llamadas', Valor: statistics.totalCalls, Trend: statistics.trends.calls.trend, Change: statistics.trends.calls.change },
      { Parámetro: 'Total de Incendios', Valor: statistics.monthlyData.reduce((sum, item) => sum + item.incendios, 0), Trend: statistics.trends.fires.trend, Change: statistics.trends.fires.change },
      { Parámetro: 'Total de Accidentes', Valor: statistics.monthlyData.reduce((sum, item) => sum + item.accidentes, 0), Trend: statistics.trends.accidents.trend, Change: statistics.trends.accidents.change },
      { Parámetro: 'Total de Traslados', Valor: statistics.totalTransfers, Trend: statistics.trends.transfers.trend, Change: statistics.trends.transfers.change },
      { Parámetro: 'Promedio Unidades', Valor: statistics.avgUnits, Trend: statistics.trends.units.trend, Change: statistics.trends.units.change },
      { Parámetro: 'Tasa de Traslados', Valor: `${statistics.transferRate}%`, Trend: 'stable', Change: 0 }
    ]
    const summaryWs = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen con Tendencias")

    XLSX.writeFile(wb, "estadisticas_bomberos.xlsx")
  }
