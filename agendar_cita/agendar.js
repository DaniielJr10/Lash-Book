const form = document.querySelector('#appointment-form');
const toast = document.querySelector('#toast');
const toastTitle = toast.querySelector('.toast-title');
const toastMessage = toast.querySelector('.toast-message');
const appointmentId = new URLSearchParams(window.location.search).get('id');
let toastTimer;

const formatAmount = (value) => {
	const digits = String(value || '').replace(/\D/g, '');
	return digits ? Number(digits).toLocaleString('es-CO') : '';
};
const cleanAmount = (value) => String(value || '').replace(/\D/g, '');
['price', 'deposit'].forEach((fieldId) => {
	const field = document.querySelector(`#${fieldId}`);
	field.addEventListener('input', () => { field.value = formatAmount(field.value); });
});

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
	document.querySelector('#price').value = formatAmount(appointment.price);
	document.querySelector('#deposit').value = formatAmount(appointment.deposit);
	document.querySelector('#notes').value = appointment.notes || '';
	document.querySelector('.form-header h1').textContent = 'Editar cita';
	document.querySelector('.submit-button').textContent = 'Guardar cambios';
};

loadAppointment().catch(() => {
	toastTitle.textContent = 'No se pudo cargar';
	toastMessage.textContent = 'Intenta abrir la cita nuevamente.';
	toast.classList.add('is-visible');
});

form.addEventListener('submit', async (event) => {
	event.preventDefault();
	if (!form.reportValidity()) return;
	const formData = new FormData(form);
	const appointment = {
		id: appointmentId || undefined,
		client: formData.get('client').trim(),
		service: formData.get('service'),
		date: formData.get('date'),
		time: formData.get('time'),
		price: cleanAmount(formData.get('price')),
		deposit: cleanAmount(formData.get('deposit')),
		notes: formData.get('notes')
	};
	const saveButton = document.querySelector('.submit-button');
	saveButton.disabled = true;
	saveButton.textContent = 'Verificando horario...';
	try {
		if (await LashBookStorage.hasAppointmentConflict(appointment)) {
			toastTitle.textContent = 'Horario ocupado';
			toastMessage.textContent = 'Ya existe una cita para esa fecha y hora.';
			toast.classList.add('is-visible');
			return;
		}
		saveButton.textContent = appointmentId ? 'Guardando cambios...' : 'Guardando cita...';
		await LashBookStorage.saveAppointment(appointment);
	} catch {
		toastTitle.textContent = 'No se pudo guardar';
		toastMessage.textContent = 'Revisa tu conexión e inténtalo nuevamente.';
		toast.classList.add('is-visible');
		return;
	} finally {
		saveButton.disabled = false;
		saveButton.textContent = appointmentId ? 'Guardar cambios' : 'Agendar cita';
	}

	toastTitle.textContent = appointmentId ? 'Cita actualizada' : 'Cita agendada';
	toastMessage.textContent = appointmentId ? 'Los cambios se guardaron correctamente.' : 'La cita se guardó correctamente.';
	toast.classList.add('is-visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		window.location.href = '../inicio.html';
	}, 1200);
});
