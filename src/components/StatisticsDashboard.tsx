
import { Card, CardContent } from "@/ui/card"
import { parsearDatosServicio } from "@/utils/parseData"
import { TablaServicios } from "./TablaDeServicios"

interface FileData {
  headers: string[]
  rows: any[][]
  rawData: any[]
}

interface StatisticsDashboardProps {
  data: FileData | null
}

export function StatisticsDashboard({ data }: StatisticsDashboardProps) {
  console.log(data)


  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No hay datos disponibles. Por favor, carga un archivo primero.</p>
        </CardContent>
      </Card>
    )
  }
  console.log(data)

  return (
  <div className="space-y-6">

    <TablaServicios servicios={parsearDatosServicio(data)} />


    </div>
  )
}