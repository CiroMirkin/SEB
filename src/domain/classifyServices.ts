import type { Servicio } from "@/model/service"
import { accidentsCodes, firesCodes } from "@/model/serviceCodes"

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
  const tiposIncendio = firesCodes

  const tiposAccidente = accidentsCodes

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
