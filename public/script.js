// public/script.js
document.getElementById('questionarioForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => data[key] = value);
  
    // Invia i dati al backend
    try {
      const res = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
  
      const { report } = await res.json();
      mostraReport(report);
    } catch (error) {
      console.error("Errore nell'invio del questionario:", error);
    }
  });
  
  function mostraReport(report) {
    document.getElementById('risultato').classList.remove('hidden');
    document.getElementById('reportTesto').innerHTML = `
      <p><strong>Analisi:</strong></p>
      <pre>${JSON.stringify(report.analisi, null, 2)}</pre>
      <p><strong>Diagnosi Possibili:</strong> ${report.diagnosiPossibili?.join(', ')}</p>
      <p><strong>Raccomandazioni Generali:</strong></p>
      <ul>${report.raccomandazioniGenerali?.map(r => `<li>${r}</li>`).join('')}</ul>
    `;
  
    const ctx = document.getElementById('radarChart').getContext('2d');
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: report.radarChart.map(e => e.category),
        datasets: [{
          label: 'Qualità della Vita',
          data: report.radarChart.map(e => e.value),
          fill: true,
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          r: {
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
  }
  