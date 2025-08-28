import { useState } from "react"
import { FileUploader } from "@/components/FileUploader"
import { StatisticsDashboard } from "@/components/StatisticsDashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { BarChart3, Upload, FileText } from "lucide-react"
import type { DatosCSV } from "./utils/parseData"

interface FileData {
  headers: string[]
  rows: any[][]
  rawData: any[]
}

export default function Home() {
  const [fileData, setFileData] = useState<DatosCSV | null>(null)

  const handleDataLoaded = (data: DatosCSV) => {
    setFileData(data)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Sistema de Estadísticas de Bomberos
                </h1>
                <p className="text-sm text-gray-500">
                  Centralización y análisis de datos de siniestros
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Cargar Datos
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Cargar Archivo de Datos
              </h2>
              <p className="text-lg text-gray-600">
                Sube tu archivo CSV o Excel para generar estadísticas detalladas
              </p>
            </div>

            <FileUploader onDataLoaded={handleDataLoaded} />

            {fileData && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Vista Previa de Datos</CardTitle>
                  <CardDescription>
                    Primeros 5 registros del archivo cargado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {fileData.headers.slice(0, 8).map((header, index) => (
                            <th
                              key={index}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fileData.rows.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.slice(0, 8).map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Mostrando 5 de {fileData.rows.length} registros totales
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Estadísticas y Análisis
              </h2>
              <p className="text-lg text-gray-600">
                Visualización de datos y tendencias de siniestros
              </p>
            </div>

            <StatisticsDashboard data={fileData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}