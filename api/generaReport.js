import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  const data = req.body;
  const { nome, cognome, email, ...risposte } = data;

  if (!nome || !cognome || !email) {
    return res.status(400).json({ error: 'Nome, cognome ed email sono obbligatori' });
  }

  try {
    const { error: supabaseError } = await supabase
      .from('responses')
      .insert([{ nome, cognome, email, risposte }]);

    if (supabaseError) {
      console.error('Errore Supabase:', supabaseError);
      return res.status(500).json({ error: 'Errore nel salvataggio su Supabase' });
    }

    return res.status(200).json({ message: 'Questionario inviato con successo!' });

  } catch (err) {
    console.error('Errore generale:', err);
    res.status(500).json({ error: 'Errore nel server' });
  }
}