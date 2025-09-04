import type { Servicio } from "@/model/service"


// Tipo para los contadores totales
export interface TotalCounterOfServiceTypes {
    [key: string]: number
}

// Tipo para los contadores por localidad
export interface CounterServiceTypesByLocation {
    [localidad: string]: {
        [key: string]: number
    }
}

/**
 * Cuenta la cantidad total de cada tipo de servicio
 * @param servicios Array de servicios
 * @param tiposServicio Array con los tipos de servicio a contar
 * @returns Objeto con la cantidad de cada tipo de servicio
 */
export function countServiceTypesTotal(
    servicios: Servicio[], 
    tiposServicio: string[]
): TotalCounterOfServiceTypes {
    const contador: TotalCounterOfServiceTypes = {}
    
    // Inicializar contador con todos los tipos en 0
    tiposServicio.forEach(tipo => {
        contador[tipo] = 0
    })
    
    servicios.forEach(servicio => {
        if (tiposServicio.includes(servicio.tipoServicio)) {
            contador[servicio.tipoServicio]++
        }
    })
    
    return contador
}
/**
 * Cuenta la cantidad de cada tipo de servicio agrupado por localidad
 * @param servicios Array de servicios
 * @param tiposServicio Array con los tipos de servicio a contar
 * @param localidades Array con las localidades a procesar
 * @returns Objeto con la cantidad de cada tipo de servicio por localidad
 */
export function countServiceTypesByLocation(
    servicios: Servicio[], 
    tiposServicio: string[],
    localidades: string[]
): CounterServiceTypesByLocation {
    const contador: CounterServiceTypesByLocation = {}
    
    localidades.forEach(localidad => {
        contador[localidad] = {}
        tiposServicio.forEach(tipoServ => {
            contador[localidad][tipoServ] = 0
        })
    })
    
    servicios.forEach(servicio => {
        const { localidad, tipoServicio: tipo } = servicio
        if (localidades.includes(localidad) && tiposServicio.includes(tipo)) {
            contador[localidad][tipo]++
        }
    })
    
    return contador
}
