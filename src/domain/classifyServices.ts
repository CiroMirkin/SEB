import type { Servicio } from "@/model/service"

export interface ClassifiedServices {
  accidentes: Servicio[]
  incendios: Servicio[]
  rescates: Servicio[]
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
    "INCENDIO ESTRUCTURAL",
    "INCENDIOS-OTROS",
    "INSECTOS",
    "Incendio Forestal",
    "Incendio-Forestal",
    "Incendio-otros",
    "Incendios- Otros",
    "Incendios-Comercios",
    "Incendios-Industrias",
    "Incendios-Otros",
    "Incendios-Vehicular",
    "Incendios-vivienda",
  ]

  const tiposAccidente = ["ACCIDENTE Aéreo", "Accidente-Transito"]

  const tiposRescate = [
    "RESCATE-SERvicio de ambulancia",
    "Rescate-Animales",
    "Rescate-Servicio de ambulancia",
    "Rescate-animales",
    "Rescate-personas",
    "Rescate-servicio de ambulancia",
    "Rescates- personas",
  ]

  const normalizar = (str: string): string =>
    str.toLowerCase().trim().replace(/\s+/g, " ")

  const incendiosSet = new Set(tiposIncendio.map(normalizar))
  const accidentesSet = new Set(tiposAccidente.map(normalizar))
  const rescatesSet = new Set(tiposRescate.map(normalizar))

  const resultado: ClassifiedServices = {
    accidentes: [],
    incendios: [],
    rescates: [],
  }

  servicios.forEach((servicio) => {
    const tipoNormalizado = normalizar(servicio.tipoServicio)

    if (incendiosSet.has(tipoNormalizado)) {
      resultado.incendios.push(servicio)
    } 
    else if (accidentesSet.has(tipoNormalizado)) {
      resultado.accidentes.push(servicio)
    } 
    else if (rescatesSet.has(tipoNormalizado)) {
      resultado.rescates.push(servicio)
    }
  })

  return resultado
}
