import type { Servicio } from "@/model/service"

export function getServices(servicios: Servicio[]): string[] {
  const tiposSet = new Set<string>()
  
  servicios.forEach(servicio => {
    tiposSet.add(getService(servicio))
  })
  
  return Array.from(tiposSet).sort()
}

export function getService(servicio: Servicio): string {
     if (servicio.tipoServicio) {
      const tipo = servicio.tipoServicio
      return tipo.toLowerCase().includes('especial') && tipo.toLowerCase().includes('otro') 
        ? 'Servicios especiales-otros' 
        : tipo
    }
    return 'Desconocido'
}