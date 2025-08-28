import type { Servicio } from "./parseData";

// Function to group services by year and month
export function groupServicesByYearAndMonth(servicios: Servicio[]): Record<number, Record<number, Servicio[]>> {
  const groupedServices: Record<number, Record<number, Servicio[]>> = {};
  
  servicios.forEach(servicio => {
    // Skip services without valid year or month
    if (!servicio.anno || !servicio.mes) {
        console.log(servicio)
      console.warn('Servicio sin año o mes válido:', servicio.id);
      return;
    }
    
    const ano = servicio.anno;
    const mes = servicio.mes;
    
    // Initialize year if doesn't exist
    if (!groupedServices[ano]) {
      groupedServices[ano] = {};
    }
    
    // Initialize month if doesn't exist
    if (!groupedServices[ano][mes]) {
      groupedServices[ano][mes] = [];
    }
    
    // Add service to the corresponding year and month
    groupedServices[ano][mes].push(servicio);
  });
  
  // Sort services within each month by date
  Object.keys(groupedServices).forEach(ano => {
    Object.keys(groupedServices[parseInt(ano)]).forEach(mes => {
      groupedServices[parseInt(ano)][parseInt(mes)].sort((a, b) => {
        if (!a.fechaPedido || !b.fechaPedido) return 0;
        return a.fechaPedido.getTime() - b.fechaPedido.getTime();
      });
    });
  });
  
  return groupedServices;
}

// Alternative function that returns a flatter structure: {"año": Servicio[]}
export function groupServicesByYear(servicios: Servicio[]): Record<number, Servicio[]> {
  const groupedServices: Record<number, Servicio[]> = {};
  
  servicios.forEach(servicio => {
    // Skip services without valid year
    if (!servicio.anno) {
      console.warn('Servicio sin año válido:', servicio.id);
      return;
    }
    
    const ano = servicio.anno;
    
    // Initialize year if doesn't exist
    if (!groupedServices[ano]) {
      groupedServices[ano] = [];
    }
    
    // Add service to the corresponding year
    groupedServices[ano].push(servicio);
  });
  
  // Sort services within each year by date and month
  Object.keys(groupedServices).forEach(ano => {
    groupedServices[parseInt(ano)].sort((a, b) => {
      // First sort by month
      if (a.mes !== b.mes && a.mes && b.mes) {
        return a.mes - b.mes;
      }
      
      // Then sort by date within the same month
      if (!a.fechaPedido || !b.fechaPedido) return 0;
      return a.fechaPedido.getTime() - b.fechaPedido.getTime();
    });
  });
  
  return groupedServices;
}