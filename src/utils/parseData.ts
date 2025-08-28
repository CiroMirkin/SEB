// Interface for defining the parsed object structure
export interface Servicio {
  id: string;
  marcaTemporal: string;
  horaLlamado: string;
  fechaPedido: Date | null;
  mes: number | null; // Mes extraído de fechaPedido (1-12)
  anno: number | null; // Año extraído de fechaPedido
  numeroPartE: string;
  codigoServicio: string;
  ubicacionDireccion: string;
  localidad: string;
  tipoServicio: string;
  descripcion: string;
  movilesIntervinientes: string[]; // Fusión de movil + movilInterviniente1-3
  personalInterviniente: number | string; // Can be number or names separated by commas
  datos: string;
  cantidadUnidadIntervinientes: number | null;
  seRealizoTraslado: boolean | null;
  superficieAfectada: string;
  horarioLlamado: string;
}

// Interface for input data
export interface DatosCSV {
  headers: string[];
  rows: any[][];
  rawData: any[];
}

// Utility functions
const toStr = (val: any): string => String(val || '').trim();

const toNum = (val: any): number | null => {
  if (!val || val === '') return null;
  if (typeof val === 'number') return val;
  const num = parseFloat(String(val).replace(',', '.'));
  return isNaN(num) ? null : num;
};

const toBool = (val: any): boolean | null => {
  if (!val || val === '') return null;
  const str = toStr(val).toLowerCase();
  if (['sí', 'si', 'yes', 'true', '1', 'verdadero'].includes(str)) return true;
  if (['no', 'false', '0', 'falso'].includes(str)) return false;
  return null;
};

const parseDate = (input: any): Date | null => {
  if (!input) return null;
  
  const str = toStr(input);
  if (!str) return null;
  
  try {
    // Normalize 2-digit years to 4-digit (00-30 -> 20xx, 31-99 -> 19xx)
    const normalized = str.replace(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, (_, d, m, y) => {
      const year = parseInt(y) <= 30 ? `20${y.padStart(2, '0')}` : `19${y.padStart(2, '0')}`;
      return `${d}/${m}/${year}`;
    });
    
    const match = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const [, day, month, year] = match.map(Number);
      const date = new Date(year, month - 1, day);
      // Validate date
      if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
        return date;
      }
    }
    
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

const extractMonthYear = (date: Date | null) => ({
  mes: date && !isNaN(date.getTime()) ? date.getMonth() + 1 : null,
  anno: date && !isNaN(date.getTime()) ? date.getFullYear() : null
});

const parseMoviles = (...moviles: any[]): string[] => 
  moviles
    .map(toStr)
    .filter(m => m !== '')
    .filter((m, i, arr) => arr.indexOf(m) === i); // Remove duplicates

const parsePersonal = (val: any): number | string => {
  if (!val || val === '') return 0;
  if (typeof val === 'number') return val;
  
  const str = toStr(val);
  const num = parseFloat(str);
  
  // If it's a valid number, return it
  if (!isNaN(num)) return num;
  
  // If contains names indicators, return as string
  if (str.includes(',') || /\b(y|bombero)\b/i.test(str)) return str;
  
  // Try to extract number from string
  const numFromStr = parseFloat(str.replace(/[^\d.,]/g, '').replace(',', '.'));
  return !isNaN(numFromStr) ? numFromStr : str;
};

// Main parsing function using rows
export function parsearDatosServicio(datos: DatosCSV): Servicio[] {
  return datos.rows.map((row, index) => {
    try {
      const fechaPedido = parseDate(row[2]);
      const { mes, anno } = extractMonthYear(fechaPedido);
      
      return {
        id: crypto.randomUUID(),
        marcaTemporal: toStr(row[0]),
        horaLlamado: toStr(row[1]),
        fechaPedido,
        mes,
        anno,
        numeroPartE: toStr(row[3]),
        codigoServicio: toStr(row[4]),
        ubicacionDireccion: toStr(row[5]),
        localidad: toStr(row[6]).length <= 86 ? toStr(row[6]) : '',
        tipoServicio: toStr(row[7]),
        descripcion: toStr(row[8]),
        movilesIntervinientes: parseMoviles(row[9], row[10], row[11], row[12]),
        personalInterviniente: parsePersonal(row[13]),
        datos: toStr(row[14]),
        cantidadUnidadIntervinientes: toNum(row[15]),
        seRealizoTraslado: toBool(row[16]),
        superficieAfectada: toStr(row[17]),
        horarioLlamado: toStr(row[18])
      };
    } catch (error) {
      console.error(`Error processing row ${index}:`, error);
      throw error; // Re-throw to maintain error handling behavior
    }
  });
}

// Alternative function using rawData
export function parsearDatosServicioDesdeRaw(datos: DatosCSV): Servicio[] {
  return datos.rawData.map((item, index) => {
    try {
      const fechaPedido = parseDate(item["fecha del pedido"]);
      const { mes, anno } = extractMonthYear(fechaPedido);
      
      return {
        id: crypto.randomUUID(),
        marcaTemporal: toStr(item["Marca temporal"]),
        horaLlamado: toStr(item["HORA DEL LLAMADO"]),
        fechaPedido,
        mes,
        anno,
        numeroPartE: toStr(item["N° De Parte"]),
        codigoServicio: toStr(item["Código de Servicio"]),
        ubicacionDireccion: toStr(item["Ubicación/ Dirección"]),
        localidad: toStr(item["Localidad"]),
        tipoServicio: toStr(item["Tipo de Servicio"]),
        descripcion: toStr(item["Descripción "]), // Note the space
        movilesIntervinientes: parseMoviles(
          item["Móvil"],
          item["Móvil interviniente"],
          item["Movil interveniente"]
        ),
        personalInterviniente: parsePersonal(item["Personal Interviniente"]),
        datos: toStr(item["datos"]),
        cantidadUnidadIntervinientes: toNum(item["CANTIDAD DE UNIDAD INTERVENIENTES"]),
        seRealizoTraslado: toBool(item["SE REALIZO EL TRASLADO"]),
        superficieAfectada: toStr(item["superficie afectada"]),
        horarioLlamado: '' // Not available in rawData
      };
    } catch (error) {
      console.error(`Error processing raw data item ${index}:`, error);
      throw error;
    }
  });
}