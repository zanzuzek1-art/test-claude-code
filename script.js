document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('inquiry-form');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const name = data.get('name');
  const email = data.get('email');
  const phone = data.get('phone') || 'Not provided';
  const car = data.get('car') || 'Not specified';
  const message = data.get('message') || '';

  const subject = encodeURIComponent(`Car import inquiry from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nCar of interest: ${car}\n\nMessage:\n${message}`
  );

  // Replace with a real form backend (e.g. Formspree) when one is available.
  window.location.href = `mailto:info@impocar.example?subject=${subject}&body=${body}`;
});
