// Interface for defining the parsed object structure
export interface Servicio {
  id: string;
  marcaTemporal: string;
  horaLlamado: string;
  fechaPedido: Date | null;
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
interface DatosCSV {
  headers: string[];
  rows: any[][];
  rawData: any[];
}

// Function to convert Excel serial date to Date object
function convertirFechaExcel(serial: number): Date | null {
  if (!serial || typeof serial !== 'number') return null;
  
  try {
    // Excel epoch starts at January 1, 1900
    const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
    const fecha = new Date(excelEpoch.getTime() + serial * 86400000);
    return fecha;
  } catch (error) {
    console.warn(`Error converting Excel date: ${serial}`, error);
    return null;
  }
}

// Function to convert Excel time serial to time string
function convertirHoraExcel(serial: number): string {
  if (!serial || typeof serial !== 'number') return '';
  
  try {
    // Convert serial to total seconds
    const totalSeconds = Math.round(serial * 86400);
    
    // Calculate hours, minutes, seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Format as HH:MM:SS
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } catch (error) {
    console.warn(`Error converting Excel time: ${serial}`, error);
    return '';
  }
}

// Function to normalize year in date
function normalizarAno(fechaStr: string): string {
  if (!fechaStr) return fechaStr;
  
  // Handle year patterns of 2 digits and convert to 4 digits
  const patron2Digitos = /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/;
  const patron4Digitos = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  
  if (patron2Digitos.test(fechaStr) && !patron4Digitos.test(fechaStr)) {
    return fechaStr.replace(patron2Digitos, (match, dia, mes, ano) => {
      const anoNum = parseInt(ano);
      const anoCompleto = anoNum <= 30 ? `20${ano.padStart(2, '0')}` : `19${ano.padStart(2, '0')}`;
      return `${dia}/${mes}/${anoCompleto}`;
    });
  }
  
  return fechaStr;
}

// Function to parse date considering different formats
export function parsearFecha(fechaInput: any): Date | null {
  if (!fechaInput) return null;
  
  // If it's a number (Excel serial date)
  if (typeof fechaInput === 'number') {
    return convertirFechaExcel(fechaInput);
  }
  
  // If it's a string
  if (typeof fechaInput === 'string') {
    const fechaStr = fechaInput.trim();
    if (fechaStr === '') return null;
    
    try {
      const fechaNormalizada = normalizarAno(fechaStr);
      
      const match = fechaNormalizada.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match) {
        const [, dia, mes, ano] = match;
        const fecha = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
        
        if (fecha.getFullYear() == parseInt(ano) && 
            fecha.getMonth() == parseInt(mes) - 1 && 
            fecha.getDate() == parseInt(dia)) {
          return fecha;
        }
      }
      
      const fecha = new Date(fechaNormalizada);
      return isNaN(fecha.getTime()) ? null : fecha;
      
    } catch (error) {
      console.warn(`Error parsing date: ${fechaInput}`, error);
      return null;
    }
  }
  
  return null;
}

// Function to parse time input
function parsearHora(horaInput: any): string {
  if (!horaInput) return '';
  
  // If it's a number (Excel serial time)
  if (typeof horaInput === 'number') {
    return convertirHoraExcel(horaInput);
  }
  
  // If it's already a string
  if (typeof horaInput === 'string') {
    return horaInput.trim();
  }
  
  return '';
}

// Function to convert string to boolean
function parsearBooleano(valor: any): boolean | null {
  if (!valor || valor === '') return null;
  
  const valorStr = String(valor).toLowerCase().trim();
  
  if (['sí', 'si', 'yes', 'true', '1', 'verdadero'].includes(valorStr)) {
    return true;
  }
  
  if (['no', 'false', '0', 'falso'].includes(valorStr)) {
    return false;
  }
  
  return null;
}

// Function to convert string to number
function parsearNumero(valor: any): number | null {
  if (!valor || valor === '') return null;
  
  if (typeof valor === 'number') return valor;
  
  const numero = parseFloat(String(valor).replace(',', '.'));
  return isNaN(numero) ? null : numero;
}

// Function to parse moviles intervinientes into array
function parsearMovilesIntervinientes(movil: any, movil1: any, movil2: any, movil3: any): string[] {
  const moviles: string[] = [];
  
  // Add main movil if exists
  if (movil && String(movil).trim() !== '') {
    moviles.push(String(movil).trim());
  }
  
  // Add intervening moviles if they exist and are different
  const movilesIntervinientes = [movil1, movil2, movil3];
  movilesIntervinientes.forEach(m => {
    const movilStr = String(m || '').trim();
    if (movilStr !== '' && !moviles.includes(movilStr)) {
      moviles.push(movilStr);
    }
  });
  
  return moviles;
}

// Function to parse personal interviniente (can be number or names)
function parsearPersonalInterviniente(valor: any): number | string {
  if (!valor || valor === '') return 0;
  
  // If it's already a number
  if (typeof valor === 'number') return valor;
  
  const valorStr = String(valor).trim();
  
  // Try to parse as number first
  const numero = parseFloat(valorStr);
  if (!isNaN(numero)) return numero;
  
  // If it contains names (commas, "y", etc.), return as string
  if (valorStr.includes(',') || valorStr.toLowerCase().includes(' y ') || 
      valorStr.toLowerCase().includes('bomberos') || valorStr.toLowerCase().includes('bombero')) {
    return valorStr;
  }
  
  // Try one more time to parse as number
  const numeroIntento = parseFloat(valorStr.replace(/[^\d.,]/g, '').replace(',', '.'));
  return !isNaN(numeroIntento) ? numeroIntento : valorStr;
}

// Main function to parse service data
export function parsearDatosServicio(datos: DatosCSV): Servicio[] {
  const serviciosParsedos: Servicio[] = [];
  
  // Process each data row
  datos.rows.forEach((fila, indice) => {
    try {
      const servicio: Servicio = {
        id: crypto.randomUUID(),
        marcaTemporal: String(fila[0] || ''),
        horaLlamado: parsearHora(fila[1]),
        fechaPedido: parsearFecha(fila[2]),
        numeroPartE: String(fila[3] || ''),
        codigoServicio: String(fila[4] || ''),
        ubicacionDireccion: String(fila[5] || ''),
        localidad: String(fila[6] || '').length <= 86 ? String(fila[6] || '') : '',
        tipoServicio: String(fila[7] || ''),
        descripcion: String(fila[8] || ''),
        movilesIntervinientes: parsearMovilesIntervinientes(fila[9], fila[10], fila[11], fila[12]),
        personalInterviniente: parsearPersonalInterviniente(fila[13]),
        datos: String(fila[14] || ''),
        cantidadUnidadIntervinientes: parsearNumero(fila[15]),
        seRealizoTraslado: parsearBooleano(fila[16]),
        superficieAfectada: String(fila[17] || ''),
        horarioLlamado: parsearHora(fila[18]) // Index 18 for horario de llamado
      };
      
      serviciosParsedos.push(servicio);
      
    } catch (error) {
      console.error(`Error processing row ${indice}:`, error);
      console.error('Row data:', fila);
      // Continue with next row on error
    }
  });
  
  return serviciosParsedos;
}

// Alternative function that uses rawData instead of rows
export function parsearDatosServicioDesdeRaw(datos: DatosCSV): Servicio[] {
  const serviciosParsedos: Servicio[] = [];
  
  datos.rawData.forEach((item, indice) => {
    try {
      const servicio: Servicio = {
        id: crypto.randomUUID(),
        marcaTemporal: String(item["Marca temporal"] || ''),
        horaLlamado: parsearHora(item["HORA DEL LLAMADO"]),
        fechaPedido: parsearFecha(item["fecha del pedido"]),
        numeroPartE: String(item["N° De Parte"] || ''),
        codigoServicio: String(item["Código de Servicio"] || ''),
        ubicacionDireccion: String(item["Ubicación/ Dirección"] || ''),
        localidad: String(item["Localidad"] || ''),
        tipoServicio: String(item["Tipo de Servicio"] || ''),
        descripcion: String(item["Descripción "] || ''), // Note the space after "Descripción"
        movilesIntervinientes: parsearMovilesIntervinientes(
          item["Móvil"], 
          item["Móvil interviniente"], 
          item["Movil interveniente"], 
          item["Movil interveniente"] // This might need adjustment based on actual headers
        ),
        personalInterviniente: parsearPersonalInterviniente(item["Personal Interviniente"]),
        datos: String(item["datos"] || ''),
        cantidadUnidadIntervinientes: parsearNumero(item["CANTIDAD DE UNIDAD INTERVENIENTES"]),
        seRealizoTraslado: parsearBooleano(item["SE REALIZO EL TRASLADO"]),
        superficieAfectada: String(item["superficie afectada"] || ''),
        horarioLlamado: '' // This field might not exist in rawData, adjust as needed
      };
      
      serviciosParsedos.push(servicio);
      
    } catch (error) {
      console.error(`Error processing raw data item ${indice}:`, error);
      console.error('Raw data item:', item);
    }
  });
  
  return serviciosParsedos;
}

// Validation function for parsed data
export function validarServicio(servicio: Servicio): { esValido: boolean; errores: string[] } {
  const errores: string[] = [];
  
  if (!servicio.fechaPedido) {
    errores.push('Fecha del pedido es inválida');
  }

  if (!servicio.codigoServicio.trim()) {
    errores.push('Código de servicio es requerido');
  }
  
  if (!servicio.tipoServicio.trim()) {
    errores.push('Tipo de servicio es requerido');
  }
  
  if (!servicio.numeroPartE.trim()) {
    errores.push('Número de parte es requerido');
  }
  
  if (!servicio.localidad.trim()) {
    errores.push('Localidad es requerida');
  }
  
  return {
    esValido: errores.length === 0,
    errores
  };
}

// Utility function to test the parser with your sample data
export function testParser() {
  const sampleData = {
    headers: [
      "Marca temporal",
      "HORA DEL LLAMADO", 
      "fecha del pedido",
      "N° De Parte",
      "Código de Servicio",
      "Ubicación/ Dirección",
      "Localidad",
      "Tipo de Servicio",
      "Descripción ",
      "Móvil",
      "Móvil interviniente",
      "Movil interveniente",
      "Movil interveniente", 
      "Personal Interviniente",
      "datos",
      "CANTIDAD DE UNIDAD INTERVENIENTES",
      "SE REALIZO EL TRASLADO",
      "superficie afectada",
      ""
    ],
    rows: [
      [
        null,
        0.17569444444444443,
        45292,
        "001/01/2024",
        "2H",
        "CENOBIO SOTO 688",
        "VILLA DOLORES", 
        "Rescate-Servicio de ambulancia",
        "FEMENINA MAYOR DE EDAD QUE PRESENTARIA UNA CRISIS NERVIOSA. SE PROCEDE SU TRASLADO AL HOSPITAL REGIONAL DE VILLA DOLORES",
        "MOVIL 96",
        "4:13:00 a. m.",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ]
    ],
    rawData: []
  };
  
  const result = parsearDatosServicio(sampleData);
  console.log('Parsed data:', result);
  return result;
}