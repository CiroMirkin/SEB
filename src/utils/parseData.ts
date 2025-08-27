// Interfaz para definir la estructura del objeto parseado
export interface ServicioEmergencia {
  id: string
  marcaTemporal: string;
  horaLlamado: string;
  fechaPedido: Date | null;
  numeroPartE: string;
  codigoServicio: string;
  ubicacionDireccion: string;
  localidad: string;
  tipoServicio: string;
  descripcion: string;
  movil: string;
  movilInterviniente1: string;
  movilInterviniente2: string;
  movilInterviniente3: string;
  personalInterviniente: number; // Cambiado a number según los datos reales
  datos: string;
  cantidadUnidadIntervinientes: number | null;
  seRealizoTraslado: boolean | null;
  superficieAfectada: string;
  horarioLlamado: string;
}

// Interfaz para los datos de entrada
interface DatosCSV {
  headers: string[];
  rows: any[][];
  rawData: any[];
}

// Función para normalizar el año en la fecha
function normalizarAno(fechaStr: string): string {
  if (!fechaStr) return fechaStr;
  
  // Buscar patrones de año de 2 dígitos y convertirlos a 4 dígitos
  // Maneja tanto DD/MM/YY como D/M/YY
  const patron2Digitos = /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/;
  const patron4Digitos = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  
  if (patron2Digitos.test(fechaStr) && !patron4Digitos.test(fechaStr)) {
    return fechaStr.replace(patron2Digitos, (match, dia, mes, ano) => {
      // Convertir año de 2 dígitos a 4 dígitos
      // Asumimos que años 00-30 son 2000-2030, y 31-99 son 1931-1999
      const anoNum = parseInt(ano);
      const anoCompleto = anoNum <= 30 ? `20${ano.padStart(2, '0')}` : `19${ano.padStart(2, '0')}`;
      return `${dia}/${mes}/${anoCompleto}`;
    });
  }
  
  return fechaStr;
}

// Función para parsear fecha considerando diferentes formatos
export function parsearFecha(fechaStr: string): Date | null {
  if (!fechaStr || fechaStr.trim() === '') return null;
  
  try {
    const fechaNormalizada = normalizarAno(fechaStr.trim());
    
    // Intentar diferentes formatos de fecha comunes
    const formatosPatrones = [
      // DD/MM/YYYY o D/MM/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // Formato con año ya completo
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    ];
    
    // Intentar formato DD/MM/YYYY o D/M/YYYY
    const match = fechaNormalizada.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const [, dia, mes, ano] = match;
      const fecha = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      
      // Verificar si la fecha es válida
      if (fecha.getFullYear() == parseInt(ano) && 
          fecha.getMonth() == parseInt(mes) - 1 && 
          fecha.getDate() == parseInt(dia)) {
        return fecha;
      }
    }
    
    // Si no funciona, intentar parsear directamente
    const fecha = new Date(fechaNormalizada);
    return isNaN(fecha.getTime()) ? null : fecha;
    
  } catch (error) {
    console.warn(`Error al parsear fecha: ${fechaStr}`, error);
    return null;
  }
}

// Función para convertir string a booleano
function parsearBooleano(valor: string): boolean | null {
  if (!valor || valor.trim() === '') return null;
  
  const valorLower = valor.toLowerCase().trim();
  
  if (['sí', 'si', 'yes', 'true', '1', 'verdadero'].includes(valorLower)) {
    return true;
  }
  
  if (['no', 'false', '0', 'falso'].includes(valorLower)) {
    return false;
  }
  
  return null;
}

// Función para convertir string a número
function parsearNumero(valor: string): number | null {
  if (!valor || valor.trim() === '') return null;
  
  const numero = parseFloat(valor.replace(',', '.'));
  return isNaN(numero) ? null : numero;
}

// Función principal para parsear los datos
export function parsearDatosServicio(datos: DatosCSV): ServicioEmergencia[] {
  const serviciosParsedos: ServicioEmergencia[] = [];
  
  // Mapear los índices de las columnas basándose en los headers
  const headerMap: { [key: string]: number } = {};
  datos.headers.forEach((header, index) => {
    if (header && header.trim() !== '') {
      headerMap[header.toLowerCase().trim()] = index;
    }
  });
  
  // Procesar cada fila de datos
  datos.rows.forEach((fila, indice) => {
    try {
      // Basándose en la estructura real de los datos proporcionados
      const servicio: ServicioEmergencia = {
        id: crypto.randomUUID(),
        marcaTemporal: fila[0] || '', // Índice 0: Marca temporal
        horaLlamado: fila[1] || '',   // Índice 1: HORA DEL LLAMADO
        fechaPedido: parsearFecha(fila[2] || ''), // Índice 2: fecha del pedido
        numeroPartE: fila[3] || '',   // Índice 3: N° De Parte
        codigoServicio: fila[4] || '', // Índice 4: Código de Servicio
        ubicacionDireccion: fila[5] || '', // Índice 5: Ubicación/ Dirección
        localidad: fila[6].length <= 86 ? fila[6] : '',     // Índice 6: Localidad
        tipoServicio: fila[7] || '',  // Índice 7: Tipo de Servicio
        descripcion: fila[8] || '',   // Índice 8: Descripción
        movil: fila[9] || '',         // Índice 9: Móvil
        movilInterviniente1: fila[10] || '', // Índice 10: Móvil interviniente
        movilInterviniente2: fila[11] || '', // Índice 11: Movil interveniente
        movilInterviniente3: fila[12] || '', // Índice 12: Movil interveniente
        personalInterviniente: parsearNumero(fila[13]) || 0, // Índice 13: Personal Interviniente (parece ser numérico)
        datos: fila[14] || '',        // Índice 14: datos (ej: "OTRO", "ACCIDENTE VEHICULAR")
        cantidadUnidadIntervinientes: parsearNumero(fila[15]) || null, // Índice 15: CANTIDAD DE UNIDAD INTERVENIENTES
        seRealizoTraslado: parsearBooleano(fila[16]) || null, // Índice 16: SE REALIZO EL TRASLADO
        superficieAfectada: fila[17] || '', // Índice 17: superficie afectada
        horarioLlamado: fila[19] || ''  // Índice 19: horario de llamado
      };
      
      serviciosParsedos.push(servicio);
      
    } catch (error) {
      console.error(`Error procesando fila ${indice}:`, error);
      // Continuar con la siguiente fila en caso de error
    }
  });
  
  return serviciosParsedos;
}

// Función auxiliar para validar los datos parseados
export function validarServicio(servicio: ServicioEmergencia): { esValido: boolean; errores: string[] } {
  const errores: string[] = [];
  
  if (!servicio.fechaPedido) {
    errores.push('Fecha del pedido es inválida');
    console.error(servicio.fechaPedido)
}

if (!servicio.codigoServicio.trim()) {
      console.error(servicio.codigoServicio)
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

