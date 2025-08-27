import type { Statistics } from "@/components/types"
import jsPDF from "jspdf"

export const exportToPDF = async (statistics: Statistics) => {
    if (!statistics) return

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPosition = 20

    // Función para agregar encabezado
    const addHeader = () => {
      pdf.setFontSize(20)
      pdf.setTextColor(33, 37, 41)
      pdf.text('Estadísticas de Bomberos', pageWidth / 2, yPosition, { align: 'center' })
      
      if (selectedYear !== "all" || selectedMonth !== "all" || selectedLocation !== "all") {
        pdf.setFontSize(12)
        pdf.setTextColor(107, 114, 128)
        let filterText = "Filtros: "
        if (selectedYear !== "all") filterText += `Año: ${selectedYear} `
        if (selectedMonth !== "all") filterText += `Mes: ${selectedMonth} `
        if (selectedLocation !== "all") filterText += `Localidad: ${selectedLocation}`
        pdf.text(filterText, pageWidth / 2, yPosition + 8, { align: 'center' })
        yPosition += 16
      } else {
        yPosition += 8
      }
      
      pdf.setFontSize(10)
      pdf.setTextColor(107, 114, 128)
      pdf.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, pageWidth / 2, yPosition + 5, { align: 'center' })
      yPosition += 15
    }

    // Función para agregar título de sección
    const addSectionTitle = (title: string) => {
      pdf.setFontSize(14)
      pdf.setTextColor(31, 41, 55)
      pdf.text(title, 20, yPosition)
      yPosition += 8
    }

    // Función para agregar tabla simple
    const addTable = (headers: string[], data: any[][], columnWidths: number[]) => {
      let xPosition = 20
      
      // Encabezados
      pdf.setFontSize(10)
      pdf.setTextColor(255, 255, 255)
      pdf.setFillColor(59, 130, 246)
      
      headers.forEach((header, index) => {
        pdf.rect(xPosition, yPosition, columnWidths[index], 8, 'F')
        pdf.text(header, xPosition + 2, yPosition + 5)
        xPosition += columnWidths[index]
      })
      yPosition += 8

      // Datos
      pdf.setTextColor(55, 65, 81)
      data.forEach(row => {
        xPosition = 20
        row.forEach((cell, index) => {
          pdf.rect(xPosition, yPosition, columnWidths[index], 6)
          pdf.text(String(cell), xPosition + 2, yPosition + 4)
          xPosition += columnWidths[index]
        })
        yPosition += 6
      })
      yPosition += 10
    }

    // Función para verificar si necesitamos nueva página
    const checkNewPage = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - 20) {
        pdf.addPage()
        yPosition = 20
        addHeader()
      }
    }

    // Página 1: Resumen General
    addHeader()
    
    addSectionTitle('Resumen General')
    const summaryData = [
      ['Total de Llamadas', statistics.totalCalls.toString()],
      ['Total de Incendios', statistics.monthlyData.reduce((sum, item) => sum + item.incendios, 0).toString()],
      ['Total de Accidentes', statistics.monthlyData.reduce((sum, item) => sum + item.accidentes, 0).toString()],
      ['Total de Traslados', statistics.totalTransfers.toString()],
      ['Promedio Unidades', statistics.avgUnits],
      ['Tasa de Traslados', `${statistics.transferRate}%`]
    ]
    addTable(['Parámetro', 'Valor'], summaryData, [60, 100])

    checkNewPage(80)
    addSectionTitle('Resumen Mensual')
    const monthlyTableData = statistics.monthlyData.map(item => [
      item.month,
      item.incendios.toString(),
      item.accidentes.toString(),
      item.traslados.toString(),
      item.avgUnits.toString()
    ])
    addTable(['Mes', 'Incendios', 'Accidentes', 'Traslados', 'Prom. Unidades'], monthlyTableData, [30, 30, 30, 30, 40])

    // Página 2: Localidades y Tipos de Servicio
    pdf.addPage()
    yPosition = 20
    addHeader()

    addSectionTitle('Top 10 Localidades')
    const locationTableData = statistics.locationData.slice(0, 10).map(item => [
      item.location,
      item.count.toString()
    ])
    addTable(['Localidad', 'Incidentes'], locationTableData, [100, 60])

    checkNewPage(80)
    addSectionTitle('Top 8 Tipos de Servicio')
    const serviceTypeTableData = statistics.serviceTypeData.slice(0, 8).map(item => [
      item.type,
      item.count.toString()
    ])
    addTable(['Tipo de Servicio', 'Cantidad'], serviceTypeTableData, [100, 60])

    // Página 3: Códigos de Servicio y Unidades
    pdf.addPage()
    yPosition = 20
    addHeader()

    addSectionTitle('Top 10 Códigos de Servicio')
    const codigoTableData = statistics.codigoServicioData.slice(0, 10).map(item => [
      item.codigo,
      item.count.toString()
    ])
    addTable(['Código', 'Cantidad'], codigoTableData, [40, 120])

    checkNewPage(80)
    addSectionTitle('Estadísticas de Unidades')
    const unitsTableData = statistics.unitsByMonthData.map(item => [
      item.month,
      item.avgUnits.toString(),
      item.totalUnits.toString(),
      item.count.toString()
    ])
    addTable(['Mes', 'Promedio', 'Total', 'Intervenciones'], unitsTableData, [30, 30, 30, 30])

    // Página 4: Traslados y Tendencias
    pdf.addPage()
    yPosition = 20
    addHeader()

    addSectionTitle('Traslados por Mes')
    const transferTableData = statistics.transferData.map(item => [
      item.month,
      item.traslados.toString()
    ])
    addTable(['Mes', 'Traslados'], transferTableData, [60, 100])

    checkNewPage(60)
    addSectionTitle('Análisis de Tendencias')
    const trendsData = [
      ['Parámetro', 'Tendencia', 'Cambio'],
      ['Llamadas', statistics.trends.calls.trend === 'up' ? '↑ Aumento' : statistics.trends.calls.trend === 'down' ? '↓ Disminución' : '→ Estable', Math.abs(statistics.trends.calls.change).toString()],
      ['Incendios', statistics.trends.fires.trend === 'up' ? '↑ Aumento' : statistics.trends.fires.trend === 'down' ? '↓ Disminución' : '→ Estable', Math.abs(statistics.trends.fires.change).toString()],
      ['Accidentes', statistics.trends.accidents.trend === 'up' ? '↑ Aumento' : statistics.trends.accidents.trend === 'down' ? '↓ Disminución' : '→ Estable', Math.abs(statistics.trends.accidents.change).toString()],
      ['Traslados', statistics.trends.transfers.trend === 'up' ? '↑ Aumento' : statistics.trends.transfers.trend === 'down' ? '↓ Disminución' : '→ Estable', Math.abs(statistics.trends.transfers.change).toString()],
      ['Unidades', statistics.trends.units.trend === 'up' ? '↑ Aumento' : statistics.trends.units.trend === 'down' ? '↓ Disminución' : '→ Estable', Math.abs(statistics.trends.units.change).toFixed(1)]
    ]
    addTable(['Parámetro', 'Tendencia', 'Cambio'], trendsData, [50, 50, 60])

    // Guardar el PDF
    pdf.save('estadisticas_bomberos.pdf')
  }