import React from 'react';
import { Users, Activity, CalendarDays, Clock } from 'lucide-react';
import { PivotRow, HOURS_LIST } from '../types';

interface KPISectionProps {
  data: PivotRow[];
}

export const KPISection: React.FC<KPISectionProps> = ({ data }) => {
  const totalAtendimentos = data.reduce((acc, row) => acc + row.totalDia, 0);
  const activeEmployees = new Set(data.map(row => row.colaborador)).size;
  const uniqueDays = new Set(data.map(row => row.dia)).size;
  const avgPerDay = uniqueDays > 0 ? (totalAtendimentos / uniqueDays).toFixed(1) : 0;

  // Find peak hour
  const hourTotals: Record<string, number> = {};
  HOURS_LIST.forEach(h => (hourTotals[h] = 0));
  data.forEach(row => {
    HOURS_LIST.forEach(h => {
      hourTotals[h] += row.hours[h];
    });
  });

  const peakHour = Object.entries(hourTotals).reduce((a, b) => (a[1] > b[1] ? a : b), ["--:--", 0]);

  const cards = [
    { title: "Total de Atendimentos", value: totalAtendimentos.toLocaleString('pt-BR'), icon: Activity, subtitle: "No período filtrado", colorClass: "text-blue-500" },
    { title: "Média por Dia", value: Number(avgPerDay).toLocaleString('pt-BR'), icon: CalendarDays, subtitle: `${uniqueDays} dias analisados`, colorClass: "text-emerald-500" },
    { title: "Colaboradores", value: activeEmployees, icon: Users, subtitle: "Ativos na seleção", colorClass: "text-indigo-500" },
    { title: "Horário de Pico", value: peakHour[0], subtitle: `${peakHour[1]} atendimentos na faixa`, icon: Clock, colorClass: "text-orange-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-2.5 mb-4">
            <card.icon className={`h-4 w-4 ${card.colorClass} opacity-80`} strokeWidth={2.5} />
            <h3 className="text-sm font-medium text-slate-500">{card.title}</h3>
          </div>
          <div className="mt-auto">
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</div>
            {card.subtitle && <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
