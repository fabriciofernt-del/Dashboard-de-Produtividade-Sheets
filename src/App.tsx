/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { LayoutDashboard, RefreshCw, Upload, FileUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PivotRow, DashboardFilters } from './types';
import { PivotTable } from './components/PivotTable';
import { KPISection } from './components/KPISection';
import { FilterCard } from './components/FilterCard';
import { PeakHourChart } from './components/PeakHourChart';
import { motion, AnimatePresence } from 'motion/react';

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
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao carregar dados');
      }

      const { data, collaborators } = await res.json();
      setPivotData(data);
      setColaboradoresList(collaborators || []);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    setLoadingMsg("Enviando arquivo para o servidor...");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar arquivo");
      }

      setSuccess(data.message);
      // Reload dashboard data
      fetchDashboardData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Falha ao enviar arquivo. Verifique sua conexão e configurações.");
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutDashboard className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Dashboard de Atendimentos por Hora</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold leading-none mt-1">Leitura de relatórios (PDF/Excel) do MV com análise por colaborador</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="flex-1">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <FileUp className="h-5 w-5 text-blue-600" />
                Importar Dados
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-lg">
                Selecione o arquivo de faturamento/produção exportado do sistema. 
                <br/>Aceitamos formatos: <span className="font-semibold text-slate-700">.XLSX, .CSV e .PDF</span>.
              </p>
            </div>
            
            <div className="relative">
               <input 
                  type="file" 
                  id="file-upload" 
                  accept=".csv, .xlsx, .xls, .pdf"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="hidden" 
               />
               <label htmlFor="file-upload" className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  {loading ? 'Processando...' : 'Carregar Arquivo'}
               </label>
            </div>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
        )}

        {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-lg mb-6 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
              <p>{success}</p>
            </div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-slate-400"
            >
              <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="font-medium">{loadingMsg}</p>
            </motion.div>
          ) : pivotData.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50"
            >
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                <FileUp className="h-8 w-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Nenhum dado selecionado</h2>
              <p className="text-slate-500 max-w-sm mx-auto">Faça o upload de uma planilha ou PDF de produção para visualizar os dashboards e insights.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid grid-cols-1 gap-6">
                <FilterCard 
                  filters={filters} 
                  onChange={setFilters} 
                  colaboradores={colaboradoresList} 
                />
                
                <KPISection data={pivotData} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <PeakHourChart data={pivotData} />
                  </div>
                  
                  <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-semibold text-slate-800">Tabela Dinâmica de Atendimentos</h2>
                        <div className="text-[10px] font-mono text-slate-400 font-semibold bg-slate-100 px-2 py-1 rounded">
                          TOTAL: {pivotData.reduce((acc, r) => acc + r.totalDia, 0)} ATENDIMENTOS LISTADOS
                        </div>
                      </div>
                      <PivotTable data={pivotData} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-4 mt-12 text-center text-slate-400 text-xs">
        <p>© 2026 Dashboard MV Inteligente • Baseado em AI</p>
      </footer>
    </div>
  );
}
