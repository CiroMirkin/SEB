import type { Servicio } from "@/model/service"

export function getTotalNumberOfUnitsInvolved(servicios: Servicio[]): number {
    let total = 0
    servicios.map(s => {
        if(s.cantidadUnidadIntervinientes != null) {
            total += s.cantidadUnidadIntervinientes
        }
    })
    return total
}

/**
 * Obtiene el total de unidades intervinientes agrupado por localidad
 * @param servicios Array de servicios
 * @param localidades Array con las localidades a procesar
 * @returns Objeto con el total de unidades intervinientes por localidad
 */
export function getTotalNumberOfUnitsInvolvedByLocation(
    servicios: Servicio[], 
    localidades: string[]
): { [localidad: string]: number } {
    const totales: { [localidad: string]: number } = {}
    
    localidades.forEach(localidad => {
        totales[localidad] = 0
    })
    
    servicios.forEach(servicio => {
        const { localidad, cantidadUnidadIntervinientes } = servicio
        if (localidades.includes(localidad) && cantidadUnidadIntervinientes != null) {
            totales[localidad] += cantidadUnidadIntervinientes
        }
    })
    
    return totales
}