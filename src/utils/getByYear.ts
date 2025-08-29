import { type Servicio, nullDateValue } from "@/model/service";

// Alternative function that returns a flatter structure: {"año": Servicio[]}
export function groupServicesByYear(servicios: Servicio[]): Record<string, Servicio[]> {
  const groupedServices: Record<string, Servicio[]> = {};
  
  servicios.forEach(servicio => {
    // Skip services without valid year
    if (!servicio.anno || servicio.anno === nullDateValue) {
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
    groupedServices[ano].sort((a, b) => {
      // First sort by month (convert to numbers for comparison)
      if (a.mes && a.mes !== nullDateValue && b.mes && b.mes !== nullDateValue) {
        const mesA = parseInt(a.mes as string);
        const mesB = parseInt(b.mes as string);
        if (mesA !== mesB) {
          return mesA - mesB;
        }
      }
      
      // Then sort by date within the same month
      if (!a.fechaPedido || a.fechaPedido === nullDateValue || 
          !b.fechaPedido || b.fechaPedido === nullDateValue) return 0;
      
      const dateA = new Date(a.fechaPedido);
      const dateB = new Date(b.fechaPedido);
      return dateA.getTime() - dateB.getTime();
    });
  });
  
  return groupedServices;
}