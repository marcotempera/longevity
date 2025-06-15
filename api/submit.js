import dotenv from 'dotenv';
dotenv.config();
// /api/submit.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    const { nome, cognome, email, ...risposte } = req.body;

    if (!nome || !cognome || !email || Object.keys(risposte).length === 0) {
      return res.status(400).json({ success: false, message: 'Dati mancanti o incompleti' });
    }

    const { data, error } = await supabase
      .from('responses')
      .insert([{ nome, cognome, email, risposte }]);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Errore API:', err);
    return res.status(500).json({ success: false, message: 'Errore durante il salvataggio', error: err.message });
  }
}