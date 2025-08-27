
import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Input } from "@/ui/input"
import { Badge } from "@/ui/badge"
import { Alert, AlertDescription } from "@/ui/alert"
import { Progress } from "@/ui/progress"
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"

interface FileData {
  headers: string[]
  rows: any[][]
  rawData: any[]
}

interface FileUploaderProps {
  onDataLoaded: (data: FileData) => void
}

export function FileUploader({ onDataLoaded }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const processFile = useCallback(async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    setError(null)
    setSuccess(null)
    setFileName(file.name)

    try {
      let data: any[] = []
      
      if (file.name.endsWith('.csv')) {
        // Procesar CSV
        const result = await new Promise<any>((resolve, reject) => {
          Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: resolve,
            error: reject,
          })
        })
        data = result.data
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Procesar Excel
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      } else {
        throw new Error('Formato de archivo no soportado. Por favor, sube un archivo CSV o Excel.')
      }

      setUploadProgress(50)

      if (data.length < 2) {
        throw new Error('El archivo debe contener al menos una fila de encabezados y una fila de datos.')
      }

      const headers = data[0]
      const rows = data.slice(1)
      const rawData = rows.map(row => {
        const obj: any = {}
        headers.forEach((header: string, index: number) => {
          obj[header] = row[index] || ''
        })
        return obj
      })

      setUploadProgress(100)
      setSuccess(`Archivo cargado exitosamente. ${rows.length} registros encontrados.`)
      
      const fileData: FileData = {
        headers,
        rows,
        rawData
      }
      
      onDataLoaded(fileData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo')
    } finally {
      setIsUploading(false)
    }
  }, [onDataLoaded])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])


  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Cargar Archivo de Datos
        </CardTitle>
        <CardDescription>
          Sube un archivo CSV o Excel con los datos de siniestros de los bomberos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Arrastra y suelta tu archivo aquí o haz clic para seleccionarlo
          </p>
          <p className="text-xs text-gray-500">
            Formatos soportados: CSV, XLS, XLSX
          </p>
          <Input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {fileName && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{fileName}</span>
            </div>
            <Badge variant="secondary">
              {fileName.endsWith('.csv') ? 'CSV' : 'Excel'}
            </Badge>
          </div>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Procesando archivo...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Columnas esperadas:</strong></p>
          <p>Marca temporal, HORA DEL LLAMADO, fecha del pedido, N° De Parte, Código de Servicio, Ubicación/ Dirección, Localidad, Tipo de Servicio, Descripción, Móvil, CANTIDAD DE UNIDAD INTERVENIENTES, SE REALIZO EL TRASLADO, superficie afectada</p>
        </div>
      </CardContent>
    </Card>
  )
}