import type { Servicio } from "@/model/service"

export function getLocation(servicios: Servicio[]): string[] {
  const localidadesSet = new Set<string>()
  
  servicios.forEach(servicio => {
    if (servicio.localidad) {
      // Normalizar y agregar directamente
      const localidadNormalizada = servicio.localidad
        .replace(/^VILL\s/i, 'VILLA ')
        .replace(/\s+/g, ' ')
        .trim()
      
      localidadesSet.add(localidadNormalizada)
    }
  })
  
  return Array.from(localidadesSet).sort()
}