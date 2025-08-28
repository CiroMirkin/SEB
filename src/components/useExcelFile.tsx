import { useState, useCallback, type ChangeEvent } from 'react';
import * as XLSX from 'xlsx';

// Tipos e interfaces
interface SheetData {
  data: Record<string, any>[];
  sheetName: string;
  rowCount: number;
  headers: string[];
}

interface FormData {
  [key: string]: string | boolean | File | null;
}

interface UseExcelFileReturn {
  // Estados
  formData: FormData;
  selectedFile: File | null;
  sheets: SheetData[];
  isLoading: boolean;
  error: string | null;
  
  // Funciones
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  resetFile: () => void;
  getSheetByName: (sheetName: string) => SheetData | undefined;
  getAllData: () => Record<string, Record<string, any>[]>;
  
  // Utilidades
  hasFile: boolean;
  sheetsCount: number;
  totalRows: number;
}

// Tipos de error específicos para mejor manejo
type ExcelErrorType = 'FILE_READ_ERROR' | 'EXCEL_PARSE_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR';

interface ExcelProcessingError extends Error {
  type: ExcelErrorType;
  originalError?: Error;
}

// Custom hook
const useExcelFile = (): UseExcelFileReturn => {
  const [formData, setFormData] = useState<FormData>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createError = (type: ExcelErrorType, message: string, originalError?: Error): ExcelProcessingError => {
    const error = new Error(message) as ExcelProcessingError;
    error.type = type;
    error.originalError = originalError;
    return error;
  };

  const processExcelFile = useCallback((file: File): void => {
    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();

    reader.onloadend = (e: ProgressEvent<FileReader>): void => {
      try {
        if (!e.target?.result) {
          throw createError('FILE_READ_ERROR', 'No se pudo leer el archivo');
        }

        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const processedSheets: SheetData[] = [];
        
        workbook.SheetNames.forEach((sheetName: string) => {
          const worksheet = workbook.Sheets[sheetName];
          
          // Obtener el rango completo de la hoja
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
          
          // Convertir a JSON con opciones para incluir celdas vacías
          const xlRowObject = XLSX.utils.sheet_to_json(worksheet, {
            header: 1, // Usar números como headers inicialmente
            defval: '', // Valor por defecto para celdas vacías
            raw: false, // Convertir a strings para mantener consistencia
            blankrows: false // No incluir filas completamente vacías
          }) as any[][];

          if (xlRowObject.length === 0) {
            processedSheets.push({
              data: [],
              sheetName,
              rowCount: 0,
              headers: []
            });
            return;
          }

          // La primera fila contiene los headers
          const headerRow = xlRowObject[0] || [];
          const dataRows = xlRowObject.slice(1);
          
          // Asegurar que tenemos todos los headers hasta la última columna con datos
          const maxColumns = range.e.c + 1;
          const headers: string[] = [];
          
          for (let i = 0; i < maxColumns; i++) {
            const headerValue = headerRow[i];
            if (headerValue !== undefined && headerValue !== null && headerValue !== '') {
              headers.push(String(headerValue).trim());
            } else {
              headers.push(`Columna_${i + 1}`); // Nombre por defecto para columnas sin header
            }
          }

          // Convertir las filas de datos a objetos con todos los headers
          const processedData = dataRows.map(row => {
            const rowObject: Record<string, any> = {};
            headers.forEach((header, index) => {
              const cellValue = row[index];
              // Asignar valor o cadena vacía si no existe
              rowObject[header] = cellValue !== undefined && cellValue !== null ? String(cellValue).trim() : '';
            });
            return rowObject;
          });

          // Filtrar filas completamente vacías
          const filteredData = processedData.filter(row => {
            return Object.values(row).some(value => value !== '');
          });
          
          processedSheets.push({
            data: filteredData,
            sheetName,
            rowCount: filteredData.length,
            headers: headers
          });
          
          console.log(`Hoja "${sheetName}":`, {
            headers: headers,
            headerCount: headers.length,
            maxColumns: maxColumns,
            dataRows: filteredData.length,
            range: worksheet['!ref']
          });
        });

        setSelectedFile(file);
        setSheets(processedSheets);
        setIsLoading(false);
        
      } catch (err) {
        let processedError: ExcelProcessingError;
        
        if (err instanceof Error && 'type' in err) {
          processedError = err as ExcelProcessingError;
        } else {
          processedError = createError(
            'EXCEL_PARSE_ERROR', 
            'Error al procesar el archivo Excel', 
            err instanceof Error ? err : undefined
          );
        }
        
        setError(processedError.message);
        setIsLoading(false);
        console.error('Error processing Excel file:', processedError);
      }
    };

    reader.onerror = (): void => {
      const error = createError('FILE_READ_ERROR', 'Error al leer el archivo');
      setError(error.message);
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    const target = event.target;
    const value: string | boolean | File = target.type === 'checkbox' 
      ? target.checked 
      : target.type === 'file' && target.files 
        ? target.files[0]
        : target.value;
    const name = target.name;

    // Actualizar datos del formulario
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Procesar archivo Excel si es tipo file
    if (name === 'file' && target.files && target.files[0]) {
      const file = target.files[0];
      
      // Validar tipo de archivo
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ];
      
      if (!allowedTypes.includes(file.type) && 
          !file.name.toLowerCase().match(/\.(xlsx|xls|csv)$/)) {
        const error = createError('VALIDATION_ERROR', 'Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls) o CSV.');
        setError(error.message);
        return;
      }
      
      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        const error = createError('VALIDATION_ERROR', 'El archivo es demasiado grande. Tamaño máximo: 10MB');
        setError(error.message);
        return;
      }
      
      processExcelFile(file);
    }
  }, [processExcelFile]);

  const resetFile = useCallback((): void => {
    setSelectedFile(null);
    setSheets([]);
    setError(null);
    setFormData(prev => ({ ...prev, file: null }));
  }, []);

  const getSheetByName = useCallback((sheetName: string): SheetData | undefined => {
    return sheets.find(sheet => sheet.sheetName === sheetName);
  }, [sheets]);

  const getAllData = useCallback((): Record<string, Record<string, any>[]> => {
    return sheets.reduce((acc, sheet) => {
      acc[sheet.sheetName] = sheet.data;
      return acc;
    }, {} as Record<string, Record<string, any>[]>);
  }, [sheets]);

  // Valores computados
  const hasFile = Boolean(selectedFile);
  const sheetsCount = sheets.length;
  const totalRows = sheets.reduce((sum, sheet) => sum + sheet.rowCount, 0);

  return {
    // Estados
    formData,
    selectedFile,
    sheets,
    isLoading,
    error,
    
    // Funciones
    handleInputChange,
    resetFile,
    getSheetByName,
    getAllData,
    
    // Utilidades
    hasFile,
    sheetsCount,
    totalRows
  };
};

export default useExcelFile;
export type { UseExcelFileReturn, SheetData, FormData, ExcelProcessingError, ExcelErrorType };