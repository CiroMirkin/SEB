import type { Servicio } from "@/model/service"

export interface ClassifiedServices {
  accidentes: Servicio[]
  incendios: Servicio[]
}

/**
 * Clasifica los servicios según su tipo en accidentes, incendios y rescates
 * @param servicios Array de servicios a clasificar
 * @returns Objeto con arrays de servicios clasificados por tipo
 */
export function classifyServices(
  servicios: Servicio[]
): ClassifiedServices {
  const tiposIncendio = [
    "1A", "1B", "1C", "1D", "1E", "1F", "1G", "1H", "1J", "1I",
  ]

  const tiposAccidente = ["2A",
    "2B",
    "2C",
    "2D",
    "2E",
    "2F",
    "2G",
    "2H",
  ]

  const incendiosSet = new Set(tiposIncendio)
  const accidentesSet = new Set(tiposAccidente)

  const resultado: ClassifiedServices = {
    accidentes: [],
    incendios: [],
  }

  servicios.forEach((servicio) => {
    const tipo = servicio.codigoServicio

    if (incendiosSet.has(tipo)) {
      resultado.incendios.push(servicio)
    } 
    else if (accidentesSet.has(tipo)) {
      resultado.accidentes.push(servicio)
    } 
  })

  return resultado
}
