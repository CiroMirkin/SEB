import type { Servicio } from "@/model/service"

export function getServices(servicios: Servicio[]): string[] {
  const tiposSet = new Set<string>()
  
  servicios.forEach(servicio => {
    if (servicio.tipoServicio) {
      const tipo = servicio.tipoServicio
      const normalizado = tipo.toLowerCase().includes('especial') && tipo.toLowerCase().includes('otro') 
        ? 'Servicios especiales-otros' 
        : tipo
      tiposSet.add(normalizado)
    }
  })
  
  return Array.from(tiposSet).sort()
}