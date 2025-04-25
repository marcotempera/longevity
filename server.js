// server.js
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 5000;

// Configura OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// Configura Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/submit', async (req, res) => {
  const { nome, cognome, email, ...risposte } = req.body;

  try {
    // Salva su Supabase
    const { error: insertError } = await supabase
      .from('responses')
      .insert([{ nome, cognome, email, risposte }]);

    if (insertError) throw insertError;

    // Prompt per GPT-4
    const prompt = `Genera un report dettagliato per il seguente utente, includendo analisi delle aree salute fisica, mentale, nutrizione, stile di vita e suggerimenti personalizzati:

${JSON.stringify({ nome, cognome, email, ...risposte }, null, 2)}

Rispondi nel formato JSON con:
{
  "analisi": { "Stile di Vita": "...", ... },
  "radarChart": [{ "category": "...", "value": 0-100 }, ...],
  "diagnosiPossibili": ["..."],
  "raccomandazioniGenerali": ["..."]
}`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096
    });

    const text = completion.data.choices[0].message.content;
    const jsonStart = text.indexOf('{');
    const report = JSON.parse(text.slice(jsonStart));

    res.json({ success: true, report });
  } catch (err) {
    console.error('Errore backend:', err);
    res.status(500).json({
      success: false,
      message: 'Errore durante la generazione del report.',
      error: err.message
    });
  }
});

app.listen(PORT, () => console.log(`✅ Server avviato su http://localhost:${PORT}`));