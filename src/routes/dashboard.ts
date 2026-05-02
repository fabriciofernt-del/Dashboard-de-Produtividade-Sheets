import { Router } from 'express';
import { supabase } from '../db/supabaseClient';

export const dashboardRouter = Router();

dashboardRouter.get('/', async (req, res): Promise<void> => {
  try {
    const { startDate, endDate, colaborador } = req.query;

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      res.json([]);
      return;
    }

    let query = supabase.from('attendances').select('*');

    if (startDate) {
        query = query.gte('data', startDate);
    }
    if (endDate) {
        query = query.lte('data', endDate);
    }
    if (colaborador && colaborador !== 'Todos') {
        query = query.eq('colaborador', colaborador);
    }

    const { data: records, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      res.status(500).json({ error: 'Erro ao consultar o banco de dados.' });
      return;
    }

    // Since frontend expects RawData[], we map it to match RawData 
    // and let frontend use its pivoting logic OR we can do it here. 
    // User requested "devolve já agregado por colaborador × dia × hora".
    // I will return rawData but mapped properly so frontend can reuse `processPivotData`,
    // or I'll just map it to the exact RawData typescript so frontend doesn't need to change much.
    // The instruction says "devolve já agregado...". I'll aggregate it.

    const grouped: Record<string, any> = {};

    (records || []).forEach(item => {
        const key = `${item.colaborador}_${item.data}`;
        
        if (!grouped[key]) {
            grouped[key] = {
                colaborador: item.colaborador,
                data: item.data,
                dia: item.data.split('-').reverse().slice(0, 2).join('/'),
                hours: {
                    "00:00": 0, "01:00": 0, "02:00": 0, "03:00": 0,
                    "04:00": 0, "05:00": 0, "06:00": 0, "07:00": 0,
                    "08:00": 0, "09:00": 0, "10:00": 0, "11:00": 0,
                    "12:00": 0, "13:00": 0, "14:00": 0, "15:00": 0,
                    "16:00": 0, "17:00": 0, "18:00": 0, "19:00": 0,
                    "20:00": 0, "21:00": 0, "22:00": 0, "23:00": 0,
                },
                totalDia: 0
            };
        }

        const hourKey = item.hora_faixa;
        if (grouped[key].hours[hourKey] !== undefined) {
            grouped[key].hours[hourKey] += item.qtd;
            grouped[key].totalDia += item.qtd;
        }
    });

    const result = Object.values(grouped).sort((a, b) => {
        const dateCompare = a.data.localeCompare(b.data);
        if (dateCompare !== 0) return dateCompare;
        return a.colaborador.localeCompare(b.colaborador);
    });

    // To populate the filter dropdown properly, we need all collaborators across the date range, regardless of the active collaborator filter.
    let colabQuery = supabase.from('attendances').select('colaborador');
    if (startDate) colabQuery = colabQuery.gte('data', startDate);
    if (endDate) colabQuery = colabQuery.lte('data', endDate);
    
    const { data: allColabs } = await colabQuery;
    const collaborators = Array.from(new Set((allColabs || []).map(c => c.colaborador))).sort();

    res.json({ data: result, collaborators });
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});
