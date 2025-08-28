
import { Card, CardContent } from "@/ui/card"
import { parsearDatosServicioDesdeRaw, type DatosCSV } from "@/utils/parseData"
import { groupServicesByYearAndMonth } from "@/utils/getByYear"
import { analizarServiciosPorMes } from "@/utils/numerosBasicos"

interface StatisticsDashboardProps {
  data: DatosCSV | null
}

export function StatisticsDashboard({ data }: StatisticsDashboardProps) {
  console.log(data)
  const wholeData = parsearDatosServicioDesdeRaw(data ? data : {
  headers: [],
  rows: [],
  rawData: [],
})
  const groupData = groupServicesByYearAndMonth(wholeData)

  console.log(groupData)
  console.log(analizarServiciosPorMes(groupData["2024"]))
  console.log(analizarServiciosPorMes(groupData["2025"]))

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