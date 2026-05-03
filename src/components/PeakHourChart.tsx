import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { PivotRow, HOURS_LIST } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PeakHourChartProps {
  data: PivotRow[];
}

export const PeakHourChart: React.FC<PeakHourChartProps> = ({ data }) => {
  const totalsByHour = HOURS_LIST.map(h => {
    return data.reduce((acc, row) => acc + (row.hours[h] || 0), 0);
  });

  const chartData = {
    labels: HOURS_LIST.map(h => h.split(':')[0] + 'h'),
    datasets: [
      {
        label: 'Total de Atendimentos',
        data: totalsByHour,
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        hoverBackgroundColor: 'rgba(29, 78, 216, 1)',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 13 },
        bodyFont: { size: 13 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(241, 245, 249, 1)',
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 }
        },
        border: { display: false }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 }
        },
        border: { display: false }
      }
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
         <h2 className="text-base font-semibold text-slate-800">Distribuição por Horário</h2>
         <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 uppercase tracking-widest">Visão Geral</span>
      </div>
      <div className="h-[280px] w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
