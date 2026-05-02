import React from 'react';
import { Users, Activity, CalendarDays, TrendingUp } from 'lucide-react';
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
    { title: "Total de Atendimentos", value: totalAtendimentos, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Colaboradores Ativos", value: activeEmployees, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Média por Dia", value: avgPerDay, icon: CalendarDays, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Horário de Pico", value: peakHour[0], subtitle: `${peakHour[1]} atend.`, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className={`${card.bg} p-3 rounded-lg`}>
            <card.icon className={`h-6 w-6 ${card.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{card.title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
            {card.subtitle && <p className="text-xs text-slate-400 mt-0.5">{card.subtitle}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
