
import { Card, CardContent } from "@/ui/card"
import { parsearDatosServicio, type DatosCSV } from "@/utils/parseData"
import { groupServicesByYear } from "@/domain/groupServicesByYear"
import { getServicesByMonth } from "@/domain/getServicesByMonth"
import type { Sinister } from "@/model/siniester"

interface StatisticsDashboardProps {
  data: DatosCSV | null
}

export function StatisticsDashboard({ data }: StatisticsDashboardProps) {
  console.log(data)
  const wholeData = parsearDatosServicio(data ? data : {
  headers: [],
  rows: [],
  rawData: [],
})
  const servicesByYear = groupServicesByYear(wholeData)

  const siniestros: Sinister[] = []
  Object.entries(servicesByYear).forEach(([year, services]) => {
    const service = {
      year,
      servicesByMonth: Array(12).fill([])
    }
    for (let month = 0; month < 12; month++) {
      service.servicesByMonth[month] = getServicesByMonth(services, month)
    }
    siniestros.push(service)
  })


  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No hay datos disponibles. Por favor, carga un archivo primero.</p>
        </CardContent>
      </Card>
    )
  }

  return (
  <div className="space-y-6">
    </div>
  )
}