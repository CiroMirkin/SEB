import jsPDF from "jspdf"

// Interfaz para los filtros aplicados
interface PDFFilters {
  year?: string
  month?: string
  location?: string
}

// Interfaz para los datos estadísticos
interface Statistics {
  monthlyData: Array<{
    month: string
    incendios: number
    accidentes: number
    traslados: number
  }>
  locationData: Array<{
    location: string
    count: number
  }>
  serviceTypeData: Array<{
    type: string
    count: number
  }>
  codigoServicioData: Array<{
    codigo: string
    count: number
  }>
  trends: {
    fires: { trend: string; change: number }
    accidents: { trend: string; change: number }
  }
}

// Configuración del PDF
interface PDFConfig {
  pageWidth: number
  pageHeight: number
  margin: number
  colors: {
    primary: [number, number, number]
    secondary: [number, number, number]
    text: [number, number, number]
    background: [number, number, number]
  }
}

class PDFGenerator {
  private pdf: jsPDF
  private config: PDFConfig
  private yPosition: number = 20

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4')
    this.config = {
      pageWidth: this.pdf.internal.pageSize.getWidth(),
      pageHeight: this.pdf.internal.pageSize.getHeight(),
      margin: 20,
      colors: {
        primary: [59, 130, 246],
        secondary: [107, 114, 128],
        text: [31, 41, 55],
        background: [255, 255, 255]
      }
    }
  }

  private addHeader(filters?: PDFFilters): void {
    this.pdf.setFontSize(20)
    this.pdf.setTextColor(...this.config.colors.text)
    this.pdf.text('Estadísticas de Bomberos', this.config.pageWidth / 2, this.yPosition, { align: 'center' })
    
    if (filters && this.hasActiveFilters(filters)) {
      this.addFilterInfo(filters)
    }
    
    this.addGenerationDate()
    this.yPosition += 15
  }

  private hasActiveFilters(filters: PDFFilters): boolean {
    return Object.values(filters).some(filter => filter !== "all")
  }

  private addFilterInfo(filters: PDFFilters): void {
    this.pdf.setFontSize(12)
    this.pdf.setTextColor(...this.config.colors.secondary)
    
    const activeFilters = Object.entries(filters)
      .filter(([_, value]) => value !== "all")
      .map(([key, value]) => `${this.capitalizeFirst(key)}: ${value}`)
      .join(' | ')
    
    if (activeFilters) {
      this.pdf.text(`Filtros: ${activeFilters}`, this.config.pageWidth / 2, this.yPosition + 8, { align: 'center' })
      this.yPosition += 16
    }
  }

  private addGenerationDate(): void {
    this.pdf.setFontSize(10)
    this.pdf.setTextColor(...this.config.colors.secondary)
    const date = new Date().toLocaleDateString('es-AR')
    this.pdf.text(`Generado: ${date}`, this.config.pageWidth / 2, this.yPosition + 8, { align: 'center' })
  }

  private addSectionTitle(title: string): void {
    this.pdf.setFontSize(14)
    this.pdf.setTextColor(...this.config.colors.text)
    this.pdf.text(title, this.config.margin, this.yPosition)
    this.yPosition += 10
  }

  private addTable(headers: string[], data: any[][], columnWidths: number[]): void {
    this.addTableHeaders(headers, columnWidths)
    this.addTableData(data, columnWidths)
    this.yPosition += 10
  }

  private addTableHeaders(headers: string[], columnWidths: number[]): void {
    let xPosition = this.config.margin
    
    this.pdf.setFontSize(10)
    this.pdf.setTextColor(...this.config.colors.background)
    this.pdf.setFillColor(...this.config.colors.primary)
    
    headers.forEach((header, index) => {
      this.pdf.rect(xPosition, this.yPosition, columnWidths[index], 8, 'F')
      this.pdf.text(header, xPosition + 2, this.yPosition + 5)
      xPosition += columnWidths[index]
    })
    
    this.yPosition += 8
  }

  private addTableData(data: any[][], columnWidths: number[]): void {
    this.pdf.setTextColor(...this.config.colors.text)
    
    data.forEach(row => {
      let xPosition = this.config.margin
      row.forEach((cell, index) => {
        this.pdf.rect(xPosition, this.yPosition, columnWidths[index], 6)
        this.pdf.text(String(cell || ''), xPosition + 2, this.yPosition + 4)
        xPosition += columnWidths[index]
      })
      this.yPosition += 6
    })
  }

  private checkNewPage(neededSpace: number, filters?: PDFFilters): void {
    if (this.yPosition + neededSpace > this.config.pageHeight - this.config.margin) {
      this.pdf.addPage()
      this.yPosition = 20
      this.addHeader(filters)
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  private getTrendIcon(trend: string): string {
    const icons = { up: '↑ Aumento', down: '↓ Disminución', stable: '→ Estable' }
    return icons[trend as keyof typeof icons] || '→ Estable'
  }

  private calculateTotals(statistics: Statistics) {
    return {
      totalFires: statistics.monthlyData.reduce((sum, item) => sum + item.incendios, 0),
      totalAccidents: statistics.monthlyData.reduce((sum, item) => sum + item.accidentes, 0),
      totalTransfers: statistics.monthlyData.reduce((sum, item) => sum + item.traslados, 0)
    }
  }

  generatePDF(statistics: Statistics, filters?: PDFFilters): void {
    if (!statistics) return

    const totals = this.calculateTotals(statistics)

    // Página 1: Resumen General
    this.addHeader(filters)
    
    this.addSectionTitle('Resumen General')
    const summaryData = [
      ['Total de Incendios', totals.totalFires.toString()],
      ['Total de Accidentes', totals.totalAccidents.toString()],
      ['Total de Traslados', totals.totalTransfers.toString()]
    ]
    this.addTable(['Parámetro', 'Valor'], summaryData, [80, 80])

    this.checkNewPage(80, filters)
    this.addSectionTitle('Resumen Mensual')
    const monthlyData = statistics.monthlyData.map(item => [
      item.month,
      item.incendios.toString(),
      item.accidentes.toString(),
      item.traslados.toString()
    ])
    this.addTable(['Mes', 'Incendios', 'Accidentes', 'Traslados'], monthlyData, [40, 40, 40, 40])

    // Página 2: Datos por Ubicación y Tipo
    this.pdf.addPage()
    this.yPosition = 20
    this.addHeader(filters)

    this.addSectionTitle('Top 10 Localidades')
    const locationData = statistics.locationData.slice(0, 10).map(item => [item.location, item.count.toString()])
    this.addTable(['Localidad', 'Incidentes'], locationData, [100, 60])

    this.checkNewPage(80, filters)
    this.addSectionTitle('Top 8 Tipos de Servicio')
    const serviceData = statistics.serviceTypeData.slice(0, 8).map(item => [item.type, item.count.toString()])
    this.addTable(['Tipo de Servicio', 'Cantidad'], serviceData, [100, 60])

    // Página 3: Códigos de Servicio y Tendencias
    this.pdf.addPage()
    this.yPosition = 20
    this.addHeader(filters)

    this.addSectionTitle('Top 10 Códigos de Servicio')
    const codigoData = statistics.codigoServicioData.slice(0, 10).map(item => [item.codigo, item.count.toString()])
    this.addTable(['Código', 'Cantidad'], codigoData, [80, 80])

    this.checkNewPage(80, filters)
    this.addSectionTitle('Análisis de Tendencias')
    const trendsData = [
      ['Incendios', this.getTrendIcon(statistics.trends.fires.trend), Math.abs(statistics.trends.fires.change).toString()],
      ['Accidentes', this.getTrendIcon(statistics.trends.accidents.trend), Math.abs(statistics.trends.accidents.change).toString()]
    ]
    this.addTable(['Parámetro', 'Tendencia', 'Cambio'], trendsData, [50, 60, 50])

    this.pdf.save('estadisticas_bomberos.pdf')
  }
}

// Función principal exportada
export const exportToPDF = async (statistics: Statistics, filters?: PDFFilters): Promise<void> => {
  const generator = new PDFGenerator()
  generator.generatePDF(statistics, filters)
}