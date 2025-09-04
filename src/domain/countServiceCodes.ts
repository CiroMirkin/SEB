import type { Servicio } from "@/model/service"

// Tipo para los contadores totales
export interface TotalCounterOfServiceCodes {
    [key: string]: number
}

// Tipo para los contadores por localidad
export interface CounterServiceCodesByLocation {
    [localidad: string]: {
        [key: string]: number
    }
}

/**
 * Cuenta la cantidad total de cada código de servicio
 * @param servicios Array de servicios
 * @param codigosServicio Array con los códigos de servicio a contar
 * @returns Objeto con la cantidad de cada código de servicio
 */
export function countServiceCodesTotal(
    servicios: Servicio[], 
    codigosServicio: string[]
): TotalCounterOfServiceCodes {
    const contador: TotalCounterOfServiceCodes = {}
    
    codigosServicio.forEach(codigo => {
        contador[codigo] = 0
    })
    
    servicios.forEach(servicio => {
        if (codigosServicio.includes(servicio.codigoServicio)) {
            contador[servicio.codigoServicio]++
        }
    })
    
    return contador
}
/**
 * Cuenta la cantidad de cada código de servicio agrupado por localidad
 * @param servicios Array de servicios
 * @param codigosServicio Array con los códigos de servicio a contar
 * @param localidades Array con las localidades a procesar
 * @returns Objeto con la cantidad de cada código de servicio por localidad
 */
export function countServiceCodesByLocation(
  servicios: Servicio[],
  codigosServicio: string[],
  localidades: string[]
): CounterServiceCodesByLocation {
  const contador: CounterServiceCodesByLocation = {}

  localidades.forEach(localidad => {
    contador[localidad] = {}
    codigosServicio.forEach(codigoServ => {
      contador[localidad][codigoServ] = 0
    })
  })

  servicios.forEach(servicio => {
    const { localidad, codigoServicio: codigo } = servicio
    
    if (localidades.includes(localidad) && codigosServicio.includes(codigo)) {
      contador[localidad][codigo]++
    }
  })

  return contador
}
