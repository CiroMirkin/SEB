import { type Servicio, nullDateValue } from "@/model/service"

/**
 * @returns [  {"año": Servicio[]}  ]
 */
export function groupServicesByYear(servicios: Servicio[]): Record<string, Servicio[]> {
  const groupedServices: Record<string, Servicio[]> = {}
  
  servicios.forEach(servicio => {
    if (!servicio.anno || servicio.anno === nullDateValue) {
      console.warn('Servicio sin año válido:', servicio)
      return
    }
    
    const ano = servicio.anno
    if (!groupedServices[ano]) {
      groupedServices[ano] = []
    }
    groupedServices[ano].push(servicio)
  })

  return groupedServices
}