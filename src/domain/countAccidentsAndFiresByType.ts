interface MonthlyTypeCount {
  month: number;
  accidentsByType: Record<string, number>;
  firesByType: Record<string, number>;
}

interface YearlyTypeCount {
  year: string;
  monthlyCounts: MonthlyTypeCount[];
}

export default function countAccidentsAndFiresByType(accidentsAndFires: any[]): YearlyTypeCount[] {
  return accidentsAndFires.map(anual => ({
    year: anual.year.toString(), // Convertir a string
    monthlyCounts: anual.byMonth.map((monthData: any, monthIndex: number) => {
      const accidentsByType: Record<string, number> = {};
      const firesByType: Record<string, number> = {};

      // Contar accidentes por tipo
      monthData.accidents.forEach((accident: any) => {
        const tipo = accident.codigoServicio;
        accidentsByType[tipo] = (accidentsByType[tipo] || 0) + 1;
      });

      // Contar incendios por tipo
      monthData.fires.forEach((fire: any) => {
        const tipo = fire.codigoServicio;
        firesByType[tipo] = (firesByType[tipo] || 0) + 1;
      });

      return {
        month: monthIndex + 1, // Meses del 1 al 12
        accidentsByType,
        firesByType
      };
    })
  }));
}