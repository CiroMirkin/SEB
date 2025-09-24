import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, MapPin, AlertTriangle, BarChart3, Navigation } from 'lucide-react';
import type { Servicio } from "@/model/service";

interface Props {
  servicios: Servicio[];
}

interface StreetNode {
  name: string;
  accidents: number;
  isIntersection: boolean;
  servicios: Servicio[];
  intersectionStreets?: string[]; // Nuevo campo para almacenar las calles que forman la intersección
}

interface GroupNode {
  id: string;
  groupName: string;
  totalAccidents: number;
  streets: StreetNode[];
  isExpanded: boolean;
  isIntersectionGroup?: boolean; // Nuevo campo para identificar grupos de intersecciones
}

// Función para limpiar nombres de calles (copiada de getStreets.ts)
function limpiarCalle(calle: string): string {
  return calle
    .replace(/N°\s*\d+/g, '')  // Elimina números de casa (N° 123)
    .replace(/(?<!^\s*)\b\d+\b/g, '')  // Elimina números que NO estén al inicio
    .replace(/(ref:|ref)\s*.+/i, '')
    .replace(/(detras|frente|esquina|altura|entre)\s*.+/i, '')
    .replace(/[,\--]\s*$/i, '')
    .trim()
    .replace(/\s+/g, ' ');
}

// Función para calcular similitud de trigramas (copiada de getStreets.ts)
function trigramSimilarity(a: string, b: string): number {
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

// Función para extraer calles individuales de una intersección
function extractStreetsFromIntersection(intersection: string): string[] {
  return intersection.split(/ y | - | - /i).map(calle => calle.trim()).filter(calle => calle);
}

// Función para agrupar calles similares (modificada para mejor manejo de intersecciones)
function groupSimilarStreets(streets: string[]): string[][] {
  const groups: string[][] = [];
  const processed = new Set<number>();
  
  // Primero, separar intersecciones de calles individuales
  const intersectionIndices: number[] = [];
  const streetIndices: number[] = [];
  
  for (let i = 0; i < streets.length; i++) {
    if (streets[i].match(/ y | - | - | y$| -$| -$/i)) {
      intersectionIndices.push(i);
    } else {
      streetIndices.push(i);
    }
  }
  
  // Agrupar calles individuales (como antes)
  for (let i = 0; i < streetIndices.length; i++) {
    const idx = streetIndices[i];
    if (processed.has(idx)) continue;
    
    const currentGroup: string[] = [streets[idx]];
    processed.add(idx);
    
    for (let j = i + 1; j < streetIndices.length; j++) {
      const jdx = streetIndices[j];
      if (processed.has(jdx)) continue;
      
      const similarity = trigramSimilarity(streets[idx], streets[jdx]);
      if (similarity > 0.5) {
        currentGroup.push(streets[jdx]);
        processed.add(jdx);
      }
    }
    
    groups.push(currentGroup);
  }
  
  // Agrupar intersecciones por calles componentes similares
  for (let i = 0; i < intersectionIndices.length; i++) {
    const idx = intersectionIndices[i];
    if (processed.has(idx)) continue;
    
    const currentGroup: string[] = [streets[idx]];
    processed.add(idx);
    
    const currentStreets = extractStreetsFromIntersection(streets[idx]);
    
    for (let j = i + 1; j < intersectionIndices.length; j++) {
      const jdx = intersectionIndices[j];
      if (processed.has(jdx)) continue;
      
      const jStreets = extractStreetsFromIntersection(streets[jdx]);
      
      // Verificar si comparten al menos una calle similar
      const hasSimilarStreet = currentStreets.some(calleA => 
        jStreets.some(calleB => trigramSimilarity(calleA, calleB) > 0.6)
      );
      
      if (hasSimilarStreet) {
        currentGroup.push(streets[jdx]);
        processed.add(jdx);
      }
    }
    
    groups.push(currentGroup);
  }
  
  return groups;
}

// Función para obtener calles desde servicios (adaptada de getStreets.ts)
function getStreetsFromServices(servicios: Servicio[]): { [calle: string]: Servicio[] } {
  const callesMap = new Map<string, Servicio[]>();
  
  servicios.forEach(servicio => {
    if (servicio.ubicacionDireccion) {
      let direccion = servicio.ubicacionDireccion.trim();
      
      // Detectar y procesar intersecciones
      if (direccion.match(/ y | - | - /i)) {
        const partes = direccion.split(/ y | - | - /i);
        const callesLimpias = partes.map(parte => limpiarCalle(parte.trim())).filter(parte => parte);
        
        callesLimpias.forEach(calle => {
          if (!callesMap.has(calle)) {
            callesMap.set(calle, []);
          }
          callesMap.get(calle)!.push(servicio);
        });
        
        if (callesLimpias.length > 0) {
          const interseccion = callesLimpias.join(' Y ');
          if (!callesMap.has(interseccion)) {
            callesMap.set(interseccion, []);
          }
          callesMap.get(interseccion)!.push(servicio);
        }
      } 
      else {
        const calleLimpia = limpiarCalle(direccion);
        if (calleLimpia) {
          if (!callesMap.has(calleLimpia)) {
            callesMap.set(calleLimpia, []);
          }
          callesMap.get(calleLimpia)!.push(servicio);
        }
      }
    }
  });
  
  // Convertir Map a objeto
  const resultado: { [calle: string]: Servicio[] } = {};
  callesMap.forEach((servicios, calle) => {
    resultado[calle] = servicios;
  });
  
  return resultado;
}

export const StreetAccidentsTree = ({ servicios }: Props) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Procesar datos: obtener calles y agruparlas
  const { streetGroups, streetAccidentData } = useMemo(() => {
    if (!servicios || servicios.length === 0) {
      return { streetGroups: [], streetAccidentData: {} };
    }

    // Obtener calles desde los servicios
    const callesConServicios = getStreetsFromServices(servicios);
    const nombresCalles = Object.keys(callesConServicios);
    
    // Crear objeto con conteo de accidentes por calle
    const accidentData: { [street: string]: number } = {};
    Object.entries(callesConServicios).forEach(([calle, serviciosCalle]) => {
      accidentData[calle] = serviciosCalle.length;
    });

    // Agrupar calles similares
    const gruposCalles = groupSimilarStreets(nombresCalles);

    return {
      streetGroups: gruposCalles,
      streetAccidentData: accidentData
    };
  }, [servicios]);

  // Preparar datos para el árbol
  const groupData = useMemo(() => {
    if (!streetGroups || streetGroups.length === 0) {
      return [];
    }

    const grupos: GroupNode[] = streetGroups.map((grupo, index) => {
      const streetNodes: StreetNode[] = grupo.map(nombreCalle => {
        const isIntersection = /( y | - | & )/i.test(nombreCalle);
        return {
          name: nombreCalle,
          accidents: streetAccidentData[nombreCalle] || 0,
          isIntersection,
          servicios: getStreetsFromServices(servicios)[nombreCalle] || [],
          intersectionStreets: isIntersection ? extractStreetsFromIntersection(nombreCalle) : undefined
        };
      });

      const totalAccidents = streetNodes.reduce((sum, street) => sum + street.accidents, 0);
      
      // Determinar nombre del grupo
      let groupName = grupo[0];
      let isIntersectionGroup = streetNodes[0].isIntersection;
      
      if (grupo.length > 1) {
        // Para grupos de intersecciones
        if (isIntersectionGroup) {
          // Encontrar calles comunes en las intersecciones
          const allStreets = streetNodes.flatMap(node => node.intersectionStreets || []);
          const uniqueStreets = [...new Set(allStreets)];
          groupName = `Intersecciones relacionadas (${uniqueStreets.length} calles involucradas)`;
        } else {
          // Para grupos de calles individuales
          const nombreRepresentativo = grupo.reduce((prev, current) => 
            prev.length <= current.length ? prev : current
          );
          groupName = `Grupo: ${nombreRepresentativo} (${grupo.length} variantes)`;
        }
      }

      return {
        id: `group-${index}`,
        groupName,
        totalAccidents,
        streets: streetNodes.sort((a, b) => b.accidents - a.accidents),
        isExpanded: expandedGroups.has(`group-${index}`),
        isIntersectionGroup
      };
    });

    return grupos.sort((a, b) => b.totalAccidents - a.totalAccidents);
  }, [streetGroups, streetAccidentData, servicios, expandedGroups]);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getAccidentColor = (accidents: number) => {
    if (accidents >= 40) return 'text-red-600 bg-red-50';
    if (accidents >= 25) return 'text-orange-600 bg-orange-50';
    if (accidents >= 15) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getAccidentIntensity = (accidents: number) => {
    const allAccidents = Object.values(streetAccidentData);
    const maxAccidents = allAccidents.length > 0 ? Math.max(...allAccidents) : 1;
    return Math.round((accidents / maxAccidents) * 100);
  };

  // Si no hay datos, mostrar mensaje
  if (!servicios || servicios.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No hay datos disponibles</h2>
          <p className="text-gray-500">No se encontraron servicios para analizar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Análisis de Accidentes por Calles
                </h1>
                <p className="text-gray-600 mt-1">
                  {servicios.length} servicios analizados - {groupData.length} grupos de calles identificados
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Árbol de Grupos */}
        <div className="p-6">
          <div className="space-y-2">
            {groupData.slice(0, 50).map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Nodo Grupo */}
                <div 
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                    group.isIntersectionGroup ? 'bg-purple-50 hover:bg-purple-100' : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => toggleGroup(group.id)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center">
                      {group.streets.length > 1 ? (
                        expandedGroups.has(group.id) ? 
                          <ChevronDown className="w-5 h-5 text-gray-500" /> :
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                      ) : (
                        <div className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {group.isIntersectionGroup && (
                        <Navigation className="w-5 h-5 text-purple-600" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900 truncate max-w-md">
                            {group.groupName}
                          </h3>
                          {group.isIntersectionGroup ? (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              Intersecciones
                            </span>
                          ) : group.streets.length > 1 && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {group.streets.length} calles
                            </span>
                          )}
                        </div>
                        {group.streets.length > 1 && (
                          <p className="text-sm text-gray-500 mt-1 truncate max-w-lg">
                            {group.streets.slice(0, 3).map(s => s.name).join(', ')}
                            {group.streets.length > 3 && ` ... (+${group.streets.length - 3} más)`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Barra de intensidad */}
                    <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-300"
                        style={{ width: `${getAccidentIntensity(group.totalAccidents)}%` }}
                      />
                    </div>

                    {/* Contador de accidentes */}
                    <div className={`px-3 py-1 rounded-full font-bold text-sm min-w-16 text-center ${getAccidentColor(group.totalAccidents)}`}>
                      {group.totalAccidents}
                    </div>
                  </div>
                </div>

                {/* Nodos Hijos (Calles individuales o intersecciones) */}
                {expandedGroups.has(group.id) && group.streets.length > 1 && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    {group.streets.map((street, index) => (
                      <div 
                        key={`${group.id}-${index}`}
                        className="flex items-center justify-between p-3 ml-8 border-l-2 border-gray-300 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          {street.isIntersection ? (
                            <Navigation className="w-4 h-4 text-purple-500" />
                          ) : (
                            <MapPin className="w-4 h-4 text-gray-400" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-sm font-medium text-gray-700">
                                {street.name}
                              </span>
                              {street.isIntersection && (
                                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                                  Intersección
                                </span>
                              )}
                            </div>
                            {street.isIntersection && street.intersectionStreets && (
                              <div className="text-xs text-gray-500 mt-1">
                                Calles: {street.intersectionStreets.join(' • ')}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              {street.servicios.length} servicios
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Mini barra de intensidad */}
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"
                              style={{ width: `${getAccidentIntensity(street.accidents)}%` }}
                            />
                          </div>

                          <div className={`px-2 py-1 rounded font-semibold text-xs min-w-10 text-center ${getAccidentColor(street.accidents)}`}>
                            {street.accidents}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Leyenda Mejorada */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Leyenda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Intensidad de Accidentes</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-600">40+ (Crítico)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-sm text-gray-600">25-39 (Alto)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm text-gray-600">15-24 (Medio)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-600">&lt;15 (Bajo)</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Tipos de Calles</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">Intersección</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Calle individual</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-100 rounded border border-purple-300"></div>
                    <span className="text-sm text-gray-600">Grupo de intersecciones</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreetAccidentsTree;