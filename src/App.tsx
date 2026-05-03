/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { LayoutDashboard, RefreshCw, Upload, FileUp, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { PivotRow, DashboardFilters } from './types';
import { PivotTable } from './components/PivotTable';
import { KPISection } from './components/KPISection';
import { FilterCard } from './components/FilterCard';
import { PeakHourChart } from './components/PeakHourChart';
import { motion, AnimatePresence } from 'motion/react';
import { extractDataFromPDF } from './services/gemini';

export default function App() {
  const [pivotData, setPivotData] = useState<PivotRow[]>([]);
  const [colaboradoresList, setColaboradoresList] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    colaborador: "Todos"
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setLoadingMsg("Carregando dashboard...");
    setError(null);
    try {
      const url = new URL('/api/dashboard', window.location.origin);
      if (filters.startDate) url.searchParams.append('startDate', filters.startDate);
      if (filters.endDate) url.searchParams.append('endDate', filters.endDate);
      if (filters.colaborador) url.searchParams.append('colaborador', filters.colaborador);

      const res = await fetch(url);
      
      let data = null;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse response:", text);
      }

      if (!res.ok) {
        throw new Error((data && data.error) || `Erro no servidor (${res.status})`);
      }

      setPivotData(data ? data.data : []);
      setColaboradoresList(data ? (data.collaborators || []) : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao buscar dados do servidor.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data url prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let res;
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setLoadingMsg("Extraindo dados do PDF com Inteligência Artificial...");
        const base64 = await readFileAsBase64(file);
        const extractedData = await extractDataFromPDF(base64);

        setLoadingMsg("Gravando dados no servidor...");
        res = await fetch('/api/upload/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records: extractedData })
        });
      } else {
        setLoadingMsg("Enviando arquivo para o servidor...");
        const formData = new FormData();
        formData.append('file', file);
        res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
      }

      let data = null;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
         console.error("Failed to parse upload response:", text);
      }

      if (!res.ok) {
        throw new Error((data && data.error) || `Erro ao processar arquivo (${res.status})`);
      }

      setSuccess(data ? data.message : "Concluído");
      // Reload dashboard data
      fetchDashboardData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Falha ao processar arquivo. Verifique sua conexão e configurações.");
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-white h-4 w-4" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-base font-semibold text-slate-900 leading-tight">Dashboard de Atendimentos por Hora</h1>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Visão analítica de produção hospitalar/MV</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-8">
        
        {/* Upload Section */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center gap-4 justify-between transition-all hover:border-slate-300">
            <div className="flex-1">
              <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <FileUp className="h-4 w-4 text-blue-600" />
                Importar Dados de Produção
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-lg">
                Formatos aceitos: <span className="font-medium text-slate-700">.XLSX, .CSV, .PDF</span>
              </p>
            </div>
            
            <div className="relative w-full sm:w-auto mt-2 sm:mt-0">
               <input 
                  type="file" 
                  id="file-upload" 
                  accept=".csv, .xlsx, .xls, .pdf"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="hidden" 
               />
               <label htmlFor="file-upload" className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-medium rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm text-sm ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {loading ? 'Processando...' : 'Carregar Arquivo'}
               </label>
            </div>
        </div>

        {/* Global Error Banner */}
        <AnimatePresence>
          {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex flex-col shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-500" />
                  <div className="text-sm font-medium w-full">
                    <p>{error}</p>
                    {error.includes('supabase-schema.sql') && (
                      <div className="mt-3 bg-red-900/10 p-3 rounded-md text-xs font-mono text-red-800 overflow-x-auto">
                        <p className="mb-2 font-semibold">1. Abra o Editor SQL no seu painel Supabase</p>
                        <p className="mb-1 font-semibold">2. Cole e execute o seguinte script:</p>
                        <pre className="select-all">
{`CREATE TABLE public.attendances (
  id uuid default gen_random_uuid() primary key,
  colaborador text not null,
  data date not null,
  hora time not null,
  hora_faixa time not null,
  qtd integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
          )}

          {/* Success Auto-hide Banner */}
          {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg mb-6 flex items-center justify-between text-sm shadow-xs overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">{success}</span>
                </div>
                <button onClick={() => setSuccess(null)} className="text-emerald-600 hover:text-emerald-900 focus:outline-hidden p-1 rounded-md hover:bg-emerald-100 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-slate-400"
            >
              <div className="w-10 h-10 border-[3px] border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="font-medium text-sm">{loadingMsg}</p>
            </motion.div>
          ) : pivotData.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-24 mt-6 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50/50"
            >
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs border border-slate-200">
                <FileUp className="h-6 w-6 text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1.5">Nenhum dado encontrado</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">Faça o upload de um arquivo ou altere os filtros de pesquisa para visualizar os painéis.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 gap-6">
                <FilterCard 
                  filters={filters} 
                  onChange={setFilters} 
                  colaboradores={colaboradoresList} 
                />
                
                <KPISection data={pivotData} />

                <PeakHourChart data={pivotData} />
                
                <PivotTable data={pivotData} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-[1400px] mx-auto px-6 mt-12 text-center text-slate-400 text-xs">
        <p>© 2026 Dashboard MV Inteligente • Baseado em AI</p>
      </footer>
    </div>
  );
}
