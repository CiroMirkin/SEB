import { useMemo } from "react"
import { StatisticsDashboard } from "@/components/StatisticsDashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert"
import { Badge } from "@/ui/badge"
import { BarChart3, Upload, FileText, CheckCircle, AlertTriangle, Loader2, File } from "lucide-react"
import type { DatosCSV } from "./utils/parseData"
import useExcelFile from "./components/useExcelFile"
import { Button } from "./ui/button"

export default function App() {
  const {
    selectedFile,
    sheets,
    isLoading,
    error,
    hasFile,
    sheetsCount,
    totalRows,
    handleInputChange,
    resetFile
  } = useExcelFile()

  // Convertir datos del hook al formato esperado por el componente
  const fileData = useMemo((): DatosCSV | null => {
    if (!hasFile || sheets.length === 0) return null

    // Tomar la primera hoja como datos principales
    const mainSheet = sheets[0]
    if (!mainSheet.data.length) return null

    // Extraer headers de la primera fila de datos
    const headers = Object.keys(mainSheet.data[0])
    
    // Convertir datos a formato de filas
    const rows = mainSheet.data.map(row => 
      headers.map(header => row[header])
    )

    return {
      headers,
      rows,
      rawData: mainSheet.data
    } as DatosCSV
  }, [hasFile, sheets])

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
            
            {/* Indicador de estado del archivo */}
            {hasFile && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <File className="h-3 w-3" />
                  {selectedFile?.name}
                </Badge>
                <Badge variant="secondary">
                  {sheetsCount} hoja{sheetsCount !== 1 ? 's' : ''} • {totalRows} filas
                </Badge>
              </div>
            )}
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
            <TabsTrigger 
              value="statistics" 
              className="flex items-center gap-2"
              disabled={!hasFile || isLoading}
            >
              <FileText className="h-4 w-4" />
              Estadísticas
              {hasFile && <CheckCircle className="h-3 w-3 text-green-500" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Cargar Archivo de Datos
              </h2>
              <p className="text-lg text-gray-600">
                Sube tu archivo Excel o CSV para generar estadísticas detalladas
              </p>
            </div>

            {/* Estados de carga y error */}
            {isLoading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Procesando archivo...</AlertTitle>
                <AlertDescription>
                  Estamos procesando tu archivo Excel. Por favor espera.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error al procesar archivo</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Información del archivo cargado */}
            {hasFile && !isLoading && !error && (
              <div className="flex flex-wrap justify-between items-center gap-4 bg-card rounded-xl border p-6 shadow-sm">
                <div className="flex flex-col items-start gap-1.5 px-6">
                  <h3 className="w-full flex items-center gap-2 leading-none font-bold text-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Archivo cargado correctamente
                  </h3>
                  <p className="block text-muted-foreground text-base">
                    {selectedFile?.name}  
                  </p>
                </div>
                <div className="grid items-center">
                  <Button
                        onClick={resetFile}
                        variant='destructive'
                        className="font-bold"
                      >
                        Eliminar archivo
                      </Button>
                </div>
              </div>
            )}

            {/* Input de archivo personalizado */}
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar archivo</CardTitle>
                <CardDescription>
                  Selecciona un archivo Excel (.xlsx, .xls) o CSV para cargar los datos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="file"
                    name="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  
                  <div className="text-xs text-gray-500">
                    Formatos soportados: Excel (.xlsx, .xls), CSV • Tamaño máximo: 10MB
                  </div>
                </div>
              </CardContent>
            </Card>
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

            {!hasFile ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay datos cargados
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Primero debes cargar un archivo en la pestaña "Cargar Datos"
                  </p>
                </CardContent>
              </Card>
            ) : (
              <StatisticsDashboard data={fileData} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}