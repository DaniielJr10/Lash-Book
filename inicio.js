const todayList = document.querySelector('#today-list');
const upcomingList = document.querySelector('#upcoming-list');
const modal = document.querySelector('#appointment-modal');
const deleteModal = document.querySelector('#delete-modal');
let selectedAppointment = null;

const todayState = document.querySelector('#today-state');
const upcomingState = document.querySelector('#upcoming-state');
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

document.querySelector('#current-date').textContent = now.toLocaleDateString('es-ES', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	year: 'numeric'
}).replace(/^./, (letter) => letter.toUpperCase());

const formatDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
const formatTime = (time) => time ? new Date(`1970-01-01T${time}`).toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' }) : '';

const createAppointmentCard = (appointment) => {
	const card = document.createElement('button');
	card.type = 'button';
	card.className = 'appointment-card';
	card.dataset.id = appointment.id;
	card.innerHTML = `<time class="appointment-time"><strong>${formatTime(appointment.time)}</strong><span>${appointment.date === today ? 'Hoy' : formatDate(appointment.date)}</span></time><span class="appointment-info"><strong>${appointment.client}</strong><span>${appointment.service}</span></span><span class="appointment-chevron">›</span>`;
	card.addEventListener('click', () => openAppointmentDetail(appointment));
	return card;
};

const openAppointmentDetail = (appointment) => {
	selectedAppointment = appointment;
	document.querySelector('#detail-title').textContent = appointment.service;
	document.querySelector('#detail-date').textContent = `${formatDate(appointment.date)} · ${formatTime(appointment.time)}`;
	document.querySelector('#detail-client').textContent = appointment.client;
	document.querySelector('#detail-service').textContent = appointment.service;
	document.querySelector('#detail-price').textContent = appointment.price ? `$${appointment.price}` : 'Sin registrar';
	document.querySelector('#detail-deposit').textContent = appointment.deposit ? `$${appointment.deposit}` : 'Sin registrar';
	document.querySelector('#detail-notes').textContent = appointment.notes || 'Sin notas adicionales.';
	modal.hidden = false;
};

document.querySelectorAll('[data-close-modal]').forEach((element) => element.addEventListener('click', () => { modal.hidden = true; }));

document.querySelector('#edit-appointment').addEventListener('click', () => {
	window.location.href = `agendar_cita/agendar.html?id=${encodeURIComponent(selectedAppointment.id)}`;
});

document.querySelector('#delete-appointment').addEventListener('click', async () => {
	if (!selectedAppointment) return;
	document.querySelector('#delete-message').textContent = `La cita de ${selectedAppointment.client} se eliminará de tu agenda.`;
	deleteModal.hidden = false;
});

const closeDeleteModal = () => { deleteModal.hidden = true; };
document.querySelectorAll('[data-close-delete]').forEach((element) => element.addEventListener('click', closeDeleteModal));
document.querySelector('#cancel-delete').addEventListener('click', closeDeleteModal);
document.querySelector('#confirm-delete').addEventListener('click', async () => {
	if (!selectedAppointment) return;
	const button = document.querySelector('#confirm-delete');
	button.disabled = true;
	button.textContent = 'Borrando...';
	try {
		await LashBookStorage.deleteAppointment(selectedAppointment.id);
		deleteModal.hidden = true;
		modal.hidden = true;
		window.location.reload();
	} finally {
		button.disabled = false;
		button.textContent = 'Borrar cita';
	}
});

LashBookStorage.getAppointments().then((appointments) => {
	const todayAppointments = appointments.filter((appointment) => appointment.date === today);
	const upcomingAppointments = appointments.filter((appointment) => appointment.date > today);
	document.querySelector('#welcome-message').textContent = todayAppointments.length
		? `Tienes ${todayAppointments.length === 1 ? 'una cita' : `${todayAppointments.length} citas`} para hoy.`
		: 'No tienes citas para hoy.';
	if (todayAppointments.length) { todayState.remove(); todayAppointments.forEach((appointment) => todayList.append(createAppointmentCard(appointment))); }
	if (upcomingAppointments.length) { upcomingState.remove(); upcomingAppointments.forEach((appointment) => upcomingList.append(createAppointmentCard(appointment))); }
}).catch(() => { upcomingState.textContent = 'No se pudieron cargar las citas.'; });

