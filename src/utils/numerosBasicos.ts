import type { Servicio } from "./parseData";


// Interface para el objeto de entrada con meses como keys
interface ServiciosPorMes {
  [mes: string]: Servicio[];
}

// Interface para las estadísticas de cada propiedad
interface EstadisticasPropiedad {
  [valor: string]: number;
}

// Interface para el resultado final
interface ResultadoAnalisis {
  [mes: string]: {
    totalServicios: number;
    codigoServicio: EstadisticasPropiedad;
    localidad: EstadisticasPropiedad;
    tipoServicio: EstadisticasPropiedad;
    movilesIntervinientes: EstadisticasPropiedad;
    personalInterviniente: EstadisticasPropiedad;
    seRealizoTraslado: EstadisticasPropiedad;
    anno: EstadisticasPropiedad;
    horasPico: EstadisticasPropiedad; // Análisis de horas más frecuentes
  };
}

/**
 * Función principal que analiza los servicios agrupados por mes
 * @param serviciosPorMes - Objeto con servicios agrupados por mes
 * @returns Estadísticas detalladas por cada mes
 */
export function analizarServiciosPorMes(serviciosPorMes: ServiciosPorMes): ResultadoAnalisis {
  const resultado: ResultadoAnalisis = {};

  // Iterar sobre cada mes
  for (const [mes, servicios] of Object.entries(serviciosPorMes)) {
    resultado[mes] = {
      totalServicios: servicios.length,
      codigoServicio: contarOcurrencias(servicios, 'codigoServicio'),
      localidad: contarOcurrencias(servicios, 'localidad'),
      tipoServicio: contarOcurrencias(servicios, 'tipoServicio'),
      movilesIntervinientes: contarMoviles(servicios),
      personalInterviniente: contarPersonal(servicios),
      seRealizoTraslado: contarTraslados(servicios),
      anno: contarOcurrencias(servicios, 'anno'),
      horasPico: analizarHoras(servicios)
    };
  }

  return resultado;
}

/**
 * Cuenta las ocurrencias de una propiedad específica
 */
function contarOcurrencias(servicios: Servicio[], propiedad: keyof Servicio): EstadisticasPropiedad {
  const conteo: EstadisticasPropiedad = {};
  
  servicios.forEach(servicio => {
    const valor = servicio[propiedad];
    const clave = valor?.toString() || 'Sin especificar';
    conteo[clave] = (conteo[clave] || 0) + 1;
  });
  
  return conteo;
}

/**
 * Cuenta los móviles intervinientes (puede haber múltiples por servicio)
 */
function contarMoviles(servicios: Servicio[]): EstadisticasPropiedad {
  const conteo: EstadisticasPropiedad = {};
  
  servicios.forEach(servicio => {
    if (servicio.movilesIntervinientes && servicio.movilesIntervinientes.length > 0) {
      servicio.movilesIntervinientes.forEach(movil => {
        // Limpiar el texto del móvil (remover horas si las tiene)
        const movilLimpio = movil.replace(/\d{1,2}:\d{2}:\d{2}\s*(a|p)\.?\s*m\.?/gi, '').trim();
        if (movilLimpio) {
          conteo[movilLimpio] = (conteo[movilLimpio] || 0) + 1;
        }
      });
    } else {
      conteo['Sin especificar'] = (conteo['Sin especificar'] || 0) + 1;
    }
  });
  
  return conteo;
}

/**
 * Analiza el personal interviniente
 */
function contarPersonal(servicios: Servicio[]): EstadisticasPropiedad {
  const conteo: EstadisticasPropiedad = {};
  
  servicios.forEach(servicio => {
    const personal = servicio.personalInterviniente;
    let clave: string;
    
    if (typeof personal === 'number') {
      clave = `${personal} personas`;
    } else if (typeof personal === 'string' && personal.trim()) {
      clave = personal;
    } else {
      clave = 'Sin especificar';
    }
    
    conteo[clave] = (conteo[clave] || 0) + 1;
  });
  
  return conteo;
}

/**
 * Analiza si se realizaron traslados
 */
function contarTraslados(servicios: Servicio[]): EstadisticasPropiedad {
  const conteo: EstadisticasPropiedad = {};
  
  servicios.forEach(servicio => {
    let clave: string;
    
    if (servicio.seRealizoTraslado === true) {
      clave = 'Sí';
    } else if (servicio.seRealizoTraslado === false) {
      clave = 'No';
    } else {
      // Inferir del texto de descripción si contiene palabras clave
      const descripcion = servicio.descripcion?.toLowerCase() || '';
      if (descripcion.includes('traslado') || descripcion.includes('trasladado')) {
        clave = 'Sí (inferido)';
      } else if (descripcion.includes('no deseando ser trasladado')) {
        clave = 'No (rechazado)';
      } else {
        clave = 'Sin especificar';
      }
    }
    
    conteo[clave] = (conteo[clave] || 0) + 1;
  });
  
  return conteo;
}

/**
 * Analiza las horas de mayor actividad
 */
function analizarHoras(servicios: Servicio[]): EstadisticasPropiedad {
  const conteo: EstadisticasPropiedad = {};
  
  servicios.forEach(servicio => {
    const hora = servicio.horaLlamado;
    if (hora) {
      // Extraer solo la hora (sin minutos) para agrupar por franjas horarias
      const [horaStr] = hora.split(':');
      const horaNum = parseInt(horaStr);
      
      let franja: string;
      if (horaNum >= 6 && horaNum < 12) {
        franja = 'Mañana (6-12h)';
      } else if (horaNum >= 12 && horaNum < 18) {
        franja = 'Tarde (12-18h)';
      } else if (horaNum >= 18 && horaNum < 24) {
        franja = 'Noche (18-24h)';
      } else {
        franja = 'Madrugada (0-6h)';
      }
      
      conteo[franja] = (conteo[franja] || 0) + 1;
    } else {
      conteo['Sin especificar'] = (conteo['Sin especificar'] || 0) + 1;
    }
  });
  
  return conteo;
}

/**
 * Función auxiliar para mostrar resultados de forma legible
 */
export function mostrarEstadisticas(resultado: ResultadoAnalisis): void {
  for (const [mes, estadisticas] of Object.entries(resultado)) {
    console.log(`\n=== ESTADÍSTICAS DEL MES ${mes} ===`);
    console.log(`Total de servicios: ${estadisticas.totalServicios}`);
    
    console.log('\n--- Códigos de Servicio ---');
    for (const [codigo, cantidad] of Object.entries(estadisticas.codigoServicio)) {
      console.log(`${codigo}: ${cantidad}`);
    }
    
    console.log('\n--- Tipos de Servicio ---');
    for (const [tipo, cantidad] of Object.entries(estadisticas.tipoServicio)) {
      console.log(`${tipo}: ${cantidad}`);
    }
    
    console.log('\n--- Localidades ---');
    for (const [localidad, cantidad] of Object.entries(estadisticas.localidad)) {
      console.log(`${localidad}: ${cantidad}`);
    }
    
    console.log('\n--- Móviles Intervinientes ---');
    for (const [movil, cantidad] of Object.entries(estadisticas.movilesIntervinientes)) {
      console.log(`${movil}: ${cantidad}`);
    }
    
    console.log('\n--- Traslados ---');
    for (const [traslado, cantidad] of Object.entries(estadisticas.seRealizoTraslado)) {
      console.log(`${traslado}: ${cantidad}`);
    }
    
    console.log('\n--- Franjas Horarias ---');
    for (const [franja, cantidad] of Object.entries(estadisticas.horasPico)) {
      console.log(`${franja}: ${cantidad}`);
    }
  }
}

// Ejemplo de uso con los datos proporcionados
const datosEjemplo = {
  "1": [
    {
      id: "5a766c8c-b1cb-4b38-a37b-9f96617e5fac",
      marcaTemporal: "",
      horaLlamado: "4:13",
      fechaPedido: new Date("2024-01-01T03:00:00.000Z"),
      mes: 1,
      anno: 2024,
      numeroPartE: "001/01/2024",
      codigoServicio: "2H",
      ubicacionDireccion: "CENOBIO SOTO 688",
      localidad: "VILLA DOLORES",
      tipoServicio: "Rescate-Servicio de ambulancia",
      descripcion: "FEMENINA MAYOR DE EDAD QUE PRESENTARIA UNA CRISIS NERVIOSA. SE PROCEDE SU TRASLADO AL HOSPITAL REGIONAL DE VILLA DOLORES",
      movilesIntervinientes: ["MOVIL 96", "4:13:00 a. m."],
      personalInterviniente: 0,
      datos: "",
      cantidadUnidadIntervinientes: null,
      seRealizoTraslado: null,
      superficieAfectada: "",
      horarioLlamado: ""
    }
    // ... más servicios
  ]
};

// Para usar la función:
// const estadisticas = analizarServiciosPorMes(datosEjemplo);
// mostrarEstadisticas(estadisticas);