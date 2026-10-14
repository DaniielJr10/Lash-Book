const form = document.querySelector('#appointment-form');
const toast = document.querySelector('#toast');
const appointmentId = new URLSearchParams(window.location.search).get('id');
let toastTimer;

if (!appointmentId) {
	const now = new Date();
	document.querySelector('#date').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const loadAppointment = async () => {
	if (!appointmentId) return;
	const appointment = await LashBookStorage.getAppointment(appointmentId);
	if (!appointment) return;
	document.querySelector('#client').value = appointment.client || '';
	document.querySelector('#service').value = appointment.service || '';
	document.querySelector('#date').value = appointment.date || '';
	document.querySelector('#time').value = appointment.time ? appointment.time.slice(0, 5) : '';
	document.querySelector('#price').value = appointment.price || '';
	document.querySelector('#deposit').value = appointment.deposit || '';
	document.querySelector('#notes').value = appointment.notes || '';
	document.querySelector('.form-header h1').textContent = 'Editar cita';
	document.querySelector('.submit-button').textContent = 'Guardar cambios';
};

loadAppointment().catch(() => {
	toast.textContent = 'No se pudo cargar la cita.';
	toast.classList.add('is-visible');
});

form.addEventListener('submit', async (event) => {
	event.preventDefault();
	if (!form.reportValidity()) return;
	const formData = new FormData(form);
	await LashBookStorage.saveAppointment({
		id: appointmentId || undefined,
		client: formData.get('client').trim(),
		service: formData.get('service'),
		date: formData.get('date'),
		time: formData.get('time'),
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
