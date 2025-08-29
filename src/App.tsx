import { useMemo } from "react"
import { StatisticsDashboard } from "@/components/StatisticsDashboard"
import { Card, CardContent } from "@/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert"
import { Upload, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import type { DatosCSV } from "./utils/parseData"
import useExcelFile from "./components/useExcelFile"
import { Button } from "./ui/button"
import { Header } from "./components/Header"

export default function App() {
  const {
    selectedFile,
    sheets,
    isLoading,
    error,
    hasFile,
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
      <Header/>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6 mb-10">
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
           {!hasFile &&  <div className="flex flex-col flex-wrap justify-center items-center gap-6 bg-card rounded-xl border p-6 shadow-sm">
              <header className="text-center">
                <h2 className="text-xl font-bold">Cargar Archivo de Datos</h2>
                <p className="text-base">
                  Sube tu archivo Excel o CSV para generar estadísticas detalladas. Formatos soportados (.xlsx, .xls, .csv)
                </p>
              </header>
              <main>
                <div className="space-y-4">
                  <input
                    type="file"
                    name="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                </div>
              </main>
              <footer className="text-xs text-gray-500">
                Tamaño máximo del archivo: 10MB
              </footer>
            </div>}
          </div>

          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Estadísticas y Análisis
              </h2>
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
          </div>
      </main>


    </div>
  )
}