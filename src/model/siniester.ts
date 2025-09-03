import type { Servicio } from "./service"

export interface Sinister {
    year: string
    servicesByMonth: Servicio[][]
}