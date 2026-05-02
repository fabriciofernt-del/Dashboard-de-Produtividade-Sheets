import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { DashboardFilters } from '../types';

interface FilterCardProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  colaboradores: string[];
}

export const FilterCard: React.FC<FilterCardProps> = ({ filters, onChange, colaboradores }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    onChange({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      colaborador: "Todos"
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        <Filter className="h-5 w-5" />
        <h2 className="font-semibold">Filtros de Análise</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Inicial</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleInputChange}
            className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Final</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleInputChange}
            className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Colaborador</label>
          <select
            name="colaborador"
            value={filters.colaborador}
            onChange={handleInputChange}
            className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 appearance-none bg-white transition-all text-sm"
          >
            <option value="Todos">Todos os Colaboradores</option>
            {colaboradores.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {/* Parent handles real-time update but we could trigger more here */}}
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-all shadow-md active:scale-95"
          >
            <Search className="h-4 w-4" />
            Aplicar
          </button>
          
          <button
            onClick={clearFilters}
            className="h-11 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center transition-all active:scale-95"
            title="Limpar Filtros"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
