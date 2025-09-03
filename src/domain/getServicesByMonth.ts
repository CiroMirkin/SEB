import type { NullDate, Servicio } from "@/model/service";

export function getServicesByMonth(services: Servicio[], mes: number | NullDate): Servicio[] {
  if (mes == null) {
    return []
  }

  return services.filter(servicio => {
    if (servicio.mes == null) {
      return false
    }

    const servicioMes = typeof servicio.mes === 'string' ? parseInt(servicio.mes, 10) : servicio.mes
    if (isNaN(servicioMes)) {
      return false
    }

    return servicioMes === mes
  })
}