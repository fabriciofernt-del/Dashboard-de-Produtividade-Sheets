import { Router } from 'express';
import multer from 'multer';
import { processFileBuffer } from '../services/parser';
import { supabase } from '../db/supabaseClient';

export const uploadRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

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

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // Mock success for development if DB not configured yet, so UI doesn't crash completely.
        res.json({ message: `${records.length} registros processados com sucesso. (DB não configurado)` });
        return;
    }

    // Insert into Supabase
    const { error } = await supabase.from('attendances').insert(records);
    if (error) {
        console.error('Supabase Error:', error);
        res.status(500).json({ error: 'Falha ao gravar no banco de dados. Verifique a tabela.' });
        return;
    }

    res.json({ message: `${records.length} registros inseridos com sucesso.` });
  } catch (error: any) {
    console.error('Error during upload:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});
