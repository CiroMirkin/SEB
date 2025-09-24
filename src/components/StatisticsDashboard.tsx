
import { Card, CardContent } from "@/ui/card"
import { parsearDatosServicio, type DatosCSV } from "@/utils/parseData"
import { groupServicesByYear } from "@/domain/groupServicesByYear"
import { getServicesByMonth } from "@/domain/getServicesByMonth"
import type { Sinister } from "@/model/siniester"
import { classifyServices } from "@/domain/classifyServices"
import { getYearlyStatisticsSummary } from "@/domain/getYearlyStatisticsOfAccidentsAndFires"
import StatisticsDisplay from "./StatisticsDisplay"
import { useState } from "react"
import { Button } from "@/ui/button"
import { exportToPDF } from "@/utils/exportPdf"
import { TablaServicios } from "./TablaDeServicios"
import StreetAccidentsTree from "./StreetAccidentsTree"
import countAccidentsAndFiresByType from "@/domain/countAccidentsAndFiresByType"
import AccidentAndFireStats from "./AccidentAndFireStats"

interface StatisticsDashboardProps {
  data: DatosCSV | null
}

export function StatisticsDashboard({ data }: StatisticsDashboardProps) {
  const [ year, setYear ] = useState('2025')

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
    for (let month = 1; month <= 12; month++) {
      // Asignar el mes 1 al índice 0
      service.servicesByMonth[month - 1] = getServicesByMonth(services, month)
    }
    siniestros.push(service)
  })

  console.log(siniestros)

  const accidentsAndFires = siniestros.map(anual => ({
    year: anual.year,
    byMonth: anual.servicesByMonth.map(month => ({
      accidents: classifyServices(month).accidentes, 
      fires: classifyServices(month).incendios, 
    }))
  }))

  const countAccidentsAndFiresByTypeOfTheYear = countAccidentsAndFiresByType(accidentsAndFires).find(count => count.year.toString() === year)


  const statisticOfAccidentsAndFires = getYearlyStatisticsSummary(accidentsAndFires)
    .filter(statistic => statistic.year == year)[0]

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No hay datos disponibles. Por favor, carga un archivo primero.</p>
        </CardContent>
      </Card>
    )
  }

  const accidentes = accidentsAndFires
    .find(anual => anual.year === year)
    ?.byMonth.flatMap(mes => mes.accidents) || []
  
  return (
    <div className="space-y-6">
      { accidentsAndFires.map(statistic => (
        <Button onClick={() => setYear(statistic.year)}>{statistic.year}</Button>
      ))}
      <StatisticsDisplay 
        data={statisticOfAccidentsAndFires} 
      />

      {
        countAccidentsAndFiresByTypeOfTheYear &&
        <AccidentAndFireStats data={countAccidentsAndFiresByTypeOfTheYear} />
      }

      <Button onClick={() => {
      exportToPDF({
        yearlyData: statisticOfAccidentsAndFires,
        trends: {
          fires: {
            trend: "Subida", 
            change: 2,
          },
          accidents: {
            trend: 'Bajada', 
            change: 1,
          }
        }
      })
      }}>Descargar informe</Button>

      <StreetAccidentsTree servicios={accidentes} />

      <TablaServicios servicios={servicesByYear[year]} />
    </div>
  )
}