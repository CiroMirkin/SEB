import React from 'react';
import { BarChart3, TrendingUp, Hash, ArrowUp, ArrowDown, Calendar } from 'lucide-react';

interface ExtremeValue {
  value: number;
  month: string;
  monthIndex: number;
}

interface YearlyStatistic {
  year: number;
  accidents: {
    average: number;
    mode: number | number[];
    total: number;
    max: ExtremeValue;
    min: ExtremeValue;
  };
  fires: {
    average: number;
    mode: number | number[];
    total: number;
    max: ExtremeValue;
    min: ExtremeValue;
  };
}

interface StatisticsDisplayProps {
  data: YearlyStatistic;
}

const StatisticsDisplay: React.FC<StatisticsDisplayProps> = ({ data }) => {
  const StatCard = ({ 
    title, 
    value,
    color 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string;
  }) => (
    <div className={`bg-gradient-to-r ${color} rounded-lg py-4 px-2 text-white shadow-lg w-60`}>
      <div className="w-full flex flex-col items-center gap-2">
        <div className='w-full flex items-center justify-center gap-2'>
          <p className="block text-lg font-semibold opacity-90">{title}</p>
        </div>
        {value === '0' && <p className="text-xl font-bold opacity-80">{`Sin ${title}`}</p>}
        {
          value !== '0' &&
          <p className="text-2xl font-bold">{value === '0' ? `Sin ${title}` : value}</p>
        }
      </div>
    </div>
  );

  const ExtremeCard = ({ 
    type, 
    value, 
    month, 
    color 
  }: { 
    type: 'max' | 'min'; 
    value: number; 
    month: string; 
    color: string;
  }) => (
    <div className={`bg-gradient-to-r ${color} rounded-lg p-4 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className='w-full flex items-center justify-between'>
          <div className="flex items-center mb-2">
            {type === 'max' ? (
              <ArrowUp className="w-4 h-4 mr-2" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-2" />
            )}
            <p className="text-sm font-medium opacity-90">
              {type === 'max' ? 'MÁXIMO' : 'MÍNIMO'}
            </p>
          </div>
          <p className="block text-2xl font-bold">{value}</p>
        </div>
      </div>
      <div className="flex items-center mt-3 pt-2 border-t border-white/20">
        <Calendar className="w-4 h-4 mr-2 opacity-80" />
        <span className="text-sm font-medium">Mes: {month}</span>
      </div>
    </div>
  );

  if (!data) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No hay datos estadísticos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-600 text-white px-6 py-2 rounded-full">
            <h3 className="text-xl font-bold">Año {data.year}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sección de Accidentes */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
              <h4 className="text-xl font-semibold text-gray-800">Accidentes</h4>
            </div>
            
            <div className="flex gap-3">
              <StatCard
                title="Promedio Mensual"
                value={data.accidents.average.toFixed(1)}
                icon={TrendingUp}
                color="bg-blue-500"
              />
              <StatCard
                title="Total Anual"
                value={data.accidents.total}
                icon={Hash}
                color="bg-blue-500"
              />
            </div>

            {/* Máximos y Mínimos de Accidentes */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <ExtremeCard
                type="max"
                value={data.accidents.max.value}
                month={data.accidents.max.month}
                color="bg-blue-500"
              />
              <ExtremeCard
                type="min"
                value={data.accidents.min.value}
                month={data.accidents.min.month}
                color="bg-blue-500"
              />
            </div>
          </div>

          {/* Sección de Incendios */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
              <h4 className="text-xl font-semibold text-gray-800">Incendios</h4>
            </div>
            
            <div className="flex gap-3">
              <StatCard
                title="Promedio Mensual"
                value={data.fires.average.toFixed(1)}
                icon={TrendingUp}
                color="bg-red-500"
              />
              <StatCard
                title="Total Anual"
                value={data.fires.total}
                icon={Hash}
                color="bg-red-500"
              />
            </div>

            {/* Máximos y Mínimos de Incendios */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <ExtremeCard
                type="max"
                value={data.fires.max.value}
                month={data.fires.max.month}
                color="bg-red-500"
              />
              <ExtremeCard
                type="min"
                value={data.fires.min.value}
                month={data.fires.min.month}
                color="bg-red-500"
              />
            </div>
          </div>
        </div>

        {/* Resumen comparativo */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              Total de Emergencias: <span className="font-bold text-blue-600">
                {data.accidents.total + data.fires.total}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDisplay;