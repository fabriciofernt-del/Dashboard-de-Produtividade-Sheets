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
    <div className="table-container max-h-[600px] overflow-y-auto">
      <table className="w-full text-left border-collapse min-w-[1200px]">
        <thead className="bg-slate-50 sticky top-0 z-20 shadow-sm">
          <tr>
            <th className="p-4 font-semibold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 sticky-col bg-slate-50">
              Colaborador
            </th>
            <th className="p-4 font-semibold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
              Dia
            </th>
            {HOURS_LIST.map(h => (
              <th key={h} className="p-4 font-semibold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 text-center">
                {h}
              </th>
            ))}
            <th className="p-4 font-semibold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 text-center bg-slate-50/80">
              Total Dia
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={`${row.colaborador}_${idx}`} className="zebra-row transition-colors group">
              <td className="p-4 font-medium sticky-col group-hover:bg-blue-50/30">
                {row.colaborador}
              </td>
              <td className="p-4 text-slate-600 font-mono text-sm">
                {row.dia}
              </td>
              {HOURS_LIST.map(h => (
                <td key={h} className={`p-4 text-center font-mono text-sm ${row.hours[h] > 0 ? 'text-blue-600 font-medium' : 'text-slate-300'}`}>
                  {row.hours[h] || '-'}
                </td>
              ))}
              <td className="p-4 text-center font-bold text-slate-900 bg-slate-50/30">
                {row.totalDia}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={HOURS_LIST.length + 3} className="p-12 text-center text-slate-400">
                Nenhum dado encontrado para o período selecionado.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot className="bg-slate-900 text-white font-bold sticky bottom-0 z-20">
          <tr>
            <td colSpan={2} className="p-4 text-right uppercase tracking-wider text-xs">
              Total Geral
            </td>
            {HOURS_LIST.map(h => (
              <td key={h} className="p-4 text-center font-mono text-sm">
                {totalsByHour[h]}
              </td>
            ))}
            <td className="p-4 text-center font-mono text-sm bg-blue-600">
              {grandTotal}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
