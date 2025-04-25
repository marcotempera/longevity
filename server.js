// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');

dotenv.config();
const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'responses.json');

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/submit', async (req, res) => {
  const userData = req.body;

  try {
    let existing = [];
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE);
      existing = JSON.parse(raw);
    }

    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...userData
    };
    existing.push(entry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2));

    const prompt = `Genera un report dettagliato per il seguente utente, includendo analisi delle aree salute fisica, mentale, nutrizione, stile di vita e suggerimenti personalizzati:

${JSON.stringify(entry, null, 2)}

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
    res.status(500).json({ success: false, message: 'Errore durante la generazione del report.' });
  }
});

app.listen(PORT, () => console.log(`✅ Server avviato su http://localhost:${PORT}`));
