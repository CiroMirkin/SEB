
import { Card, CardContent } from "@/ui/card"
import { parsearDatosServicio, type DatosCSV } from "@/utils/parseData"
import { groupServicesByYear } from "@/utils/getByYear"

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
  const groupData = groupServicesByYear(wholeData)
  console.log(groupData)

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