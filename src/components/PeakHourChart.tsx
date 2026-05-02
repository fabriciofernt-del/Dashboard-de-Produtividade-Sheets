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
    labels: HOURS_LIST,
    datasets: [
      {
        label: 'Total de Atendimentos',
        data: totalsByHour,
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgb(37, 99, 235)',
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
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: { family: 'JetBrains Mono', size: 11 },
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'JetBrains Mono', size: 10 },
        }
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <h2 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
        Distribuição por Horário
        <span className="text-xs font-normal text-slate-400 uppercase tracking-widest">(Visualização de Pico)</span>
      </h2>
      <div className="h-[250px] w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
