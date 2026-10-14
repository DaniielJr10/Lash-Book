const form = document.querySelector('#appointment-form');
const toast = document.querySelector('#toast');
let toastTimer;

form.addEventListener('submit', async (event) => {
	event.preventDefault();
	if (!form.reportValidity()) return;
	const formData = new FormData(form);
	await LashBookStorage.saveAppointment({
		client: formData.get('client').trim(),
		service: formData.get('service'),
		date: formData.get('date'),
		time: formData.get('time'),
		duration: formData.get('duration'),
		price: formData.get('price'),
		deposit: formData.get('deposit'),
		notes: formData.get('notes')
	});

	toast.textContent = 'Cita agendada correctamente.';
	toast.classList.add('is-visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		window.location.href = '../inicio.html';
	}, 1200);
});
