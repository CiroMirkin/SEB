
export type NullDate = "No especificado"
export const nullDateValue: NullDate = "No especificado" 

export interface Servicio {
    indexRow: number
  id: string
  marcaTemporal: string
  horaLlamado: string
  fechaPedido: string | NullDate
  mes: string | NullDate // Mes extraído de fechaPedido (1-12)
  anno: string | NullDate // Año extraído de fechaPedido
  numeroPartE: string
  codigoServicio: string
  ubicacionDireccion: string
  localidad: string
  tipoServicio: string
  descripcion: string
  movilesIntervinientes: string[] // Fusión de movil + movilInterviniente1-3
  personalInterviniente: number | string // Can be number or names separated by commas
  datos: string
  cantidadUnidadIntervinientes: number | null
  seRealizoTraslado: boolean | null
  superficieAfectada: string
  horarioLlamado: string
}