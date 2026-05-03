import React from 'react';
import { PivotRow, HOURS_LIST } from '../types';

interface PivotTableProps {
  data: PivotRow[];
}

export const PivotTable: React.FC<PivotTableProps> = ({ data }) => {
  const totalsByHour = HOURS_LIST.reduce((acc, h) => ({ ...acc, [h]: 0 }), {} as Record<string, number>);
  let grandTotal = 0;

  data.forEach(row => {
    HOURS_LIST.forEach(h => {
      totalsByHour[h] += row.hours[h];
    });
    grandTotal += row.totalDia;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col mb-4">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
        <h2 className="text-base font-semibold text-slate-800">Detalhamento por Colaborador e Dia</h2>
        <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded tracking-wide">
          {data.length} REGISTROS
        </div>
      </div>
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead className="bg-slate-50 sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <tr>
              <th className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 sticky left-0 z-10 bg-slate-50 border-r border-slate-200 text-left">
                Colaborador
              </th>
              <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 text-left">
                Dia
              </th>
              {HOURS_LIST.map(h => (
                <th key={h} className="px-2 py-3 font-semibold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 text-center">
                  {h.split(':')[0]}h
                </th>
              ))}
              <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-slate-700 border-b border-slate-200 text-center bg-slate-100">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {data.map((row, idx) => (
              <tr key={`${row.colaborador}_${idx}`} className="hover:bg-blue-50/40 transition-colors group">
                <td className="px-5 py-2.5 font-medium text-sm text-slate-800 sticky left-0 z-10 group-hover:bg-blue-50/40 bg-white border-r border-slate-100">
                  {row.colaborador}
                </td>
                <td className="px-4 py-2.5 text-slate-500 font-mono text-xs whitespace-nowrap">
                  {row.dia}
                </td>
                {HOURS_LIST.map(h => (
                  <td key={h} className={`px-2 py-2.5 text-center font-mono text-xs ${row.hours[h] > 0 ? 'text-blue-700 font-semibold' : 'text-slate-300'}`}>
                    {row.hours[h] > 0 ? row.hours[h] : '-'}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-center font-bold text-slate-800 bg-slate-50/50 text-sm">
                  {row.totalDia}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={HOURS_LIST.length + 3} className="px-4 py-16 text-center text-slate-400 text-sm">
                  Nenhum dado encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-800 text-white font-medium sticky bottom-0 z-20">
            <tr>
              <td colSpan={2} className="px-5 py-3 text-right uppercase tracking-wider text-[11px] font-bold">
                Total Geral
              </td>
              {HOURS_LIST.map(h => (
                <td key={h} className="px-2 py-3 text-center font-mono text-xs font-bold text-slate-200">
                  {totalsByHour[h]}
                </td>
              ))}
              <td className="px-4 py-3 text-center font-mono text-sm font-bold bg-blue-600 text-white shadow-inner">
                {grandTotal}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
