import type { Servicio } from "@/model/service"

/**
 * Función que ordena las calles de mayor a menor según la cantidad de servicios
 * @example 
 *   const calles = getStreets(servicios)
     const callesOrdenadas = sortStreetsByServiceCount(calles)
     for (const [calle, servicios] of callesOrdenadas) {
       console.log(`${calle}: ${servicios.length} servicios`)
     }
 */
export function sortStreetsByServiceCount(callesObj: { [calle: string]: Servicio[] }): Map<string, Servicio[]> {
    const callesArray = Object.entries(callesObj)
    const callesOrdenadas = callesArray.sort((a, b) => b[1].length - a[1].length)  // Ordenar de mayor a menor
const resultado = new Map<string, Servicio[]>()
  callesOrdenadas.forEach(([calle, servicios]) => {
    resultado.set(calle, servicios)
  })

    return resultado
}