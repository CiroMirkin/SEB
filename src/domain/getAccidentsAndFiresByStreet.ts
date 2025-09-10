import type { Servicio } from "@/model/service"
import { sortStreetsByServiceCount } from "./sortStreetsByServiceCount"
import { getStreets } from "./getStreets"
import { classifyServices } from "./classifyServices"

export const getAccidentsAndFiresByStreet = (services: Servicio[]) => {
    const accidents = sortStreetsByServiceCount(
        getStreets(
          classifyServices(services).accidentes
        )
    )
    
    const fires = sortStreetsByServiceCount(
        getStreets(
          classifyServices(services).incendios
        )
    )
    return ({
        accidents,
        fires,
    })
}