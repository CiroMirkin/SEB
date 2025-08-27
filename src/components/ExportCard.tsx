import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card"
import { Button } from "@/ui/button"
import { Download } from "lucide-react"

interface ExportCardProps {
  exportToExcel: () => void
  exportToPDF: () => void
}

export const ExportCard: React.FC<ExportCardProps> = ({ exportToExcel, exportToPDF }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Exportar</CardTitle>
      <Download className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Button onClick={exportToExcel} size="sm" className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Excel
        </Button>
        <Button onClick={exportToPDF} size="sm" variant="outline" className="w-full">
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
      </div>
    </CardContent>
  </Card>
)