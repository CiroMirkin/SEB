import type { Servicio } from "@/model/service"

export function getStreets(servicios: Servicio[]): string[] {
  const callesSet = new Set<string>()
  
  servicios.forEach(servicio => {
    if (servicio.ubicacionDireccion) {
      let direccion = servicio.ubicacionDireccion.trim()
      
      // Detectar y procesar intersecciones
      if (direccion.match(/ y | - | – /i)) {
        const partes = direccion.split(/ y | - | – /i)
        direccion = partes.map(parte => limpiarCalle(parte.trim())).filter(parte => parte).join(' Y ')
      } else {
        direccion = limpiarCalle(direccion)
      }
      
      if (direccion) callesSet.add(direccion)
    }
  })
  
  return Array.from(callesSet).sort()
}

function limpiarCalle(calle: string): string {
  return calle
    .replace(/(N°\s*\d+|\b\d+\b)/g, '')  // Solo números, no elimina letras con números
    .replace(/(ref:|ref)\s*.+/i, '')
    .replace(/(detras|frente|esquina|altura|entre)\s*.+/i, '')
    .replace(/[,\-–]\s*$/i, '')
    .trim()
    .replace(/\s+/g, ' ')
}