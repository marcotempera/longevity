document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('questionarioForm');
  if (!form || !(form instanceof HTMLFormElement)) {
    console.error('Form non trovato o non è un elemento HTMLFormElement.');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => data[key] = value);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Reindirizza alla pagina di ringraziamento
      window.location.href = 'report.html';
    } catch (error) {
      console.error("Errore nell'invio del questionario:", error);
      alert('Si è verificato un errore durante l\'invio. Per favore riprova.');
    }
  });


  // Calcolo automatico BMI
  const pesoInput = document.getElementById('peso');
  const altezzaInput = document.getElementById('altezza');
  const bmiOutput = document.getElementById('bmi');

  function calcolaBMI() {
    const peso = parseFloat(pesoInput?.value);
    const altezza = parseFloat(altezzaInput?.value) / 100;

    if (!isNaN(peso) && !isNaN(altezza) && altezza > 0) {
      const bmi = peso / (altezza * altezza);
      if (bmiOutput) bmiOutput.value = bmi.toFixed(2);
    } else {
      if (bmiOutput) bmiOutput.value = '';
    }
  }

  if (pesoInput && altezzaInput) {
    pesoInput.addEventListener('input', calcolaBMI);
    altezzaInput.addEventListener('input', calcolaBMI);
  }
});