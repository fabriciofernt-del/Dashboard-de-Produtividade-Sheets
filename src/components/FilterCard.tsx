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

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-800">
          <Filter className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-semibold">Filtros de Análise</h2>
        </div>
        <div className="hidden md:block text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
          Período: <span className="text-slate-700">{formatDate(filters.startDate)} a {formatDate(filters.endDate)}</span> • Colaborador: <span className="text-slate-700">{filters.colaborador}</span>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="w-full lg:w-40">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Data Inicial</label>
          <div className="relative">
             <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleInputChange}
                className="w-full h-9 pl-3 pr-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-700 bg-slate-50 hover:bg-white"
            />
          </div>
        </div>
        
        <div className="w-full lg:w-40">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Data Final</label>
           <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleInputChange}
            className="w-full h-9 pl-3 pr-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-700 bg-slate-50 hover:bg-white"
          />
        </div>
        
        <div className="w-full lg:flex-1">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Colaborador</label>
          <select
            name="colaborador"
            value={filters.colaborador}
            onChange={handleInputChange}
            className="w-full h-9 px-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all text-sm text-slate-700 bg-slate-50 hover:bg-white cursor-pointer"
          >
            <option value="Todos">Todos os Colaboradores</option>
            {colaboradores.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full lg:w-auto mt-2 lg:mt-0">
          <button
            onClick={() => {}}
            className="flex-1 lg:w-28 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-all shadow-sm active:scale-95 text-sm"
          >
            <Search className="h-4 w-4" />
            Aplicar
          </button>
          
          <button
            onClick={clearFilters}
            className="h-9 px-4 border border-slate-300 hover:bg-slate-100 hover:border-slate-400 text-slate-600 rounded-lg flex items-center justify-center transition-all active:scale-95 text-sm bg-white"
            title="Limpar Filtros"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
       <div className="md:hidden mt-4 text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-md border border-slate-100 text-center flex flex-col gap-1">
          <span>Período: {formatDate(filters.startDate)} a {formatDate(filters.endDate)}</span>
          <span>Colaborador: {filters.colaborador}</span>
        </div>
    </div>
  );
};
