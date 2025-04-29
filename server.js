// server.js
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 5000;

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
    const { error: insertError } = await supabase
      .from('responses')
      .insert([{ nome, cognome, email, risposte }]);

    if (insertError) throw insertError;

    res.json({ success: true, message: 'Questionario salvato con successo' });
  } catch (err) {
    console.error('Errore backend:', err);
    res.status(500).json({
      success: false,
      message: 'Errore durante il salvataggio.',
      error: err.message
    });
  }
});

app.listen(PORT, () => console.log(`✅ Server avviato su http://localhost:${PORT}`));