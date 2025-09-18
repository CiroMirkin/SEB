import jsPDF from "jspdf"

// Interfaz para los filtros aplicados
interface PDFFilters {
  year?: string
  month?: string
  location?: string
}

// Interfaz para las estadísticas anuales
interface YearlyStatistics {
  year: number
  accidents: {
    average: number
    mode: number | number[]
    total: number
    max: {
      value: number
      month: string
      monthIndex: number
    }
    min: {
      value: number
      month: string
      monthIndex: number
    }
  }
  fires: {
    average: number
    mode: number | number[]
    total: number
    max: {
      value: number
      month: string
      monthIndex: number
    }
    min: {
      value: number
      month: string
      monthIndex: number
    }
  }
}

// Interfaz para los datos estadísticos actualizada
interface Statistics {
  yearlyData: YearlyStatistics  // Cambiado de monthlyData a yearlyData (objeto único, no array)
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

  private formatMode(mode: number | number[]): string {
    return Array.isArray(mode) ? mode.join(', ') : mode.toString()
  }

  private calculateTotals(statistics: Statistics) {
    return {
      totalFires: statistics.yearlyData.fires.total,
      totalAccidents: statistics.yearlyData.accidents.total,
      // Mantener traslados como 0 o calcularlo de otra fuente si existe
      totalTransfers: 0
    }
  }

  generatePDF(statistics: Statistics, filters?: PDFFilters): void {
    if (!statistics || !statistics.yearlyData) return

    const totals = this.calculateTotals(statistics)
    const yearData = statistics.yearlyData

    // Página 1: Resumen General
    this.addHeader(filters)
    
    this.addSectionTitle('Resumen General')
    const summaryData = [
      ['Año Analizado', yearData.year.toString()],
      ['Total de Incendios', totals.totalFires.toString()],
      ['Total de Accidentes', totals.totalAccidents.toString()],
      ['Promedio Mensual - Incendios', yearData.fires.average.toString()],
      ['Promedio Mensual - Accidentes', yearData.accidents.average.toString()]
    ]
    this.addTable(['Parámetro', 'Valor'], summaryData, [100, 60])

    this.checkNewPage(80, filters)
    this.addSectionTitle('Estadísticas Detalladas - Incendios')
    const firesDetailData = [
      ['Total Anual', yearData.fires.total.toString()],
      ['Promedio Mensual', yearData.fires.average.toString()],
      ['Valor Más Frecuente (Moda)', this.formatMode(yearData.fires.mode)],
      ['Pico Máximo', `${yearData.fires.max.value} en ${yearData.fires.max.month}`],
      ['Valor Mínimo', `${yearData.fires.min.value} en ${yearData.fires.min.month}`]
    ]
    this.addTable(['Estadística', 'Valor'], firesDetailData, [100, 60])

    this.checkNewPage(80, filters)
    this.addSectionTitle('Estadísticas Detalladas - Accidentes')
    const accidentsDetailData = [
      ['Total Anual', yearData.accidents.total.toString()],
      ['Promedio Mensual', yearData.accidents.average.toString()],
      ['Valor Más Frecuente (Moda)', this.formatMode(yearData.accidents.mode)],
      ['Pico Máximo', `${yearData.accidents.max.value} en ${yearData.accidents.max.month}`],
      ['Valor Mínimo', `${yearData.accidents.min.value} en ${yearData.accidents.min.month}`]
    ]
    this.addTable(['Estadística', 'Valor'], accidentsDetailData, [100, 60])

    // Página 2: Análisis de Tendencias
    this.pdf.addPage()
    this.yPosition = 20
    this.addHeader(filters)

    this.addSectionTitle('Análisis de Tendencias')
    const trendsData = [
      ['Incendios', this.getTrendIcon(statistics.trends.fires.trend), Math.abs(statistics.trends.fires.change).toString()],
      ['Accidentes', this.getTrendIcon(statistics.trends.accidents.trend), Math.abs(statistics.trends.accidents.change).toString()]
    ]
    this.addTable(['Parámetro', 'Tendencia', 'Cambio'], trendsData, [50, 60, 50])

    this.pdf.save('estadisticas_bomberos_anuales.pdf')
  }
}

// Función principal exportada
export const exportToPDF = async (statistics: Statistics, filters?: PDFFilters): Promise<void> => {
  const generator = new PDFGenerator()
  generator.generatePDF(statistics, filters)
}