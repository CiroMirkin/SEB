import type { Servicio } from "@/model/service"

export function getServiceCodes(servicios: Servicio[]): string[] {
  const codigosSet = new Set<string>()
  
  servicios.forEach(servicio => {
    if (servicio.codigoServicio) {
      codigosSet.add(servicio.codigoServicio)
    }
  })
  
  return Array.from(codigosSet).sort()
}