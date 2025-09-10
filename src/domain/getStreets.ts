import type { Servicio } from "@/model/service"

export function getStreets(servicios: Servicio[]): { [calle: string]: Servicio[] } {
  const callesMap = new Map<string, Servicio[]>()
  
  servicios.forEach(servicio => {
    if (servicio.ubicacionDireccion) {
      let direccion = servicio.ubicacionDireccion.trim()
      
      // Detectar y procesar intersecciones
      if (direccion.match(/ y | - | - /i)) {
        const partes = direccion.split(/ y | - | - /i)
        const callesLimpias = partes.map(parte => limpiarCalle(parte.trim())).filter(parte => parte)
        
        callesLimpias.forEach(calle => {
          if (!callesMap.has(calle)) {
            callesMap.set(calle, [])
          }
          callesMap.get(calle)!.push(servicio)
        })
        
        if (callesLimpias.length > 0) {
          const interseccion = callesLimpias.join(' Y ')
          if (!callesMap.has(interseccion)) {
            callesMap.set(interseccion, [])
          }
          callesMap.get(interseccion)!.push(servicio)
        }
      } 
      else {
        const calleLimpia = limpiarCalle(direccion)
        if (calleLimpia) {
          if (!callesMap.has(calleLimpia)) {
            callesMap.set(calleLimpia, [])
          }
          callesMap.get(calleLimpia)!.push(servicio)
        }
      }
    }
  })
  
  // Convertir Map a objeto y ordenar las claves
  const resultado: { [calle: string]: Servicio[] } = {}
  const callesOrdenadas = Array.from(callesMap.keys()).sort()
  
  callesOrdenadas.forEach(calle => {
    resultado[calle] = callesMap.get(calle)!
  })
  
  return resultado
}

function limpiarCalle(calle: string): string {
  return calle
    .replace(/N°\s*\d+/g, '')  // Elimina números de casa (N° 123)
    .replace(/(?<!^\s*)\b\d+\b/g, '')  // Elimina números que NO estén al inicio
    .replace(/(ref:|ref)\s*.+/i, '')
    .replace(/(detras|frente|esquina|altura|entre)\s*.+/i, '')
    .replace(/[,\--]\s*$/i, '')
    .trim()
    .replace(/\s+/g, ' ')
}
/** 
 * Función para calcular similitud de trigramas (0 a 1)
 * @example 
 * const similarity = trigramSimilarity(streets[i], streets[j])
  if (similarity > 0.6) { // Umbral ajustable
    currentGroup.push(streets[j])
    processed.add(j)
  } 
 * */
export function trigramSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length < 3 || b.length < 3) return 0;
  
  const getTrigrams = (str: string): Set<string> => {
    const trigrams = new Set<string>();
    for (let i = 0; i <= str.length - 3; i++) {
      trigrams.add(str.substring(i, i + 3).toLowerCase());
    }
    return trigrams;
  };

  const trigramsA = getTrigrams(a);
  const trigramsB = getTrigrams(b);
  
  const intersection = new Set([...trigramsA].filter(x => trigramsB.has(x)));
  const union = new Set([...trigramsA, ...trigramsB]);
  
  return intersection.size / union.size;
}

// Función principal que retorna arreglo bidimensional con agrupaciones
export function groupSimilarStreets(streets: string[]): string[][] {
  const groups: string[][] = [];
  const processed = new Set<number>();
  
  for (let i = 0; i < streets.length; i++) {
    if (processed.has(i)) continue;
    
    const currentGroup: string[] = [streets[i]];
    processed.add(i);
    
    // Solo agrupar si NO es una intersección
    if (!streets[i].match(/ y | - | - | y$| -$| -$/i)) {
      for (let j = i + 1; j < streets.length; j++) {
        if (processed.has(j)) continue;
        
        // Verificar si es una intersección (no agrupar)
        if (streets[j].match(/ y | - | - | y$| -$| -$/i)) continue;
        
        const similarity = trigramSimilarity(streets[i], streets[j]);
        if (similarity > 0.5) { // Umbral ajustable
          currentGroup.push(streets[j]);
          processed.add(j);
        }
      }
    }
    
    groups.push(currentGroup);
  }
  
  // Agregar las intersecciones que no se procesaron
  for (let i = 0; i < streets.length; i++) {
    if (!processed.has(i)) {
      groups.push([streets[i]]);
    }
  }
  
  return groups;
}