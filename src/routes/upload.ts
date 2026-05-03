import { Router } from 'express';
import multer from 'multer';
import { processFileBuffer, mapToDbAttendance } from '../services/parser';
import { getSupabaseClient } from '../db/supabaseClient';

export const uploadRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

uploadRouter.post('/json', async (req, res): Promise<void> => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      res.status(400).json({ error: 'Nenhum registro válido fornecido.' });
      return;
    }

    const dbRecords = records.map((r: any) => mapToDbAttendance(r));
    await saveToSupabase(dbRecords, res);
  } catch (error: any) {
    console.error('Error during json upload:', error);
    res.status(400).json({ error: error.message || 'Internal Server Error' });
  }
});

uploadRouter.post('/', upload.single('file'), async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      return;
    }

    const { originalname, buffer, mimetype } = req.file;
    const records = await processFileBuffer(buffer, mimetype, originalname);
    
    if (records.length === 0) {
      res.status(400).json({ error: 'Nenhum registro válido encontrado no arquivo.' });
      return;
    }

    await saveToSupabase(records, res);
  } catch (error: any) {
    console.error('Error during upload:', error);
    res.status(400).json({ error: error.message || 'Internal Server Error' });
  }
});

async function saveToSupabase(records: any[], res: any) {
  const supabase = getSupabaseClient();
  if (!supabase) {
      // Mock success for development if DB not configured yet, so UI doesn't crash completely.
      res.json({ message: `${records.length} registros processados com sucesso. (Supabase não configurado no .env)` });
      return;
  }

  // Insert into Supabase
  const { error } = await supabase.from('attendances').insert(records);
  if (error) {
      console.error('Supabase Error:', error);
      if (error.message?.includes('schema cache') || error.code === 'PGRST205') {
        res.status(400).json({ error: "A tabela 'attendances' não existe no banco de dados. Por favor, execute o script SQL 'supabase-schema.sql' no seu painel Supabase." });
      } else {
        res.status(400).json({ error: `Falha ao gravar no banco de dados. Verifique a tabela. (${error.message})` });
      }
      return;
  }

  res.json({ message: `${records.length} registros inseridos com sucesso.` });
}
