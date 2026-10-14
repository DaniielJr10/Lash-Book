const todayList = document.querySelector('#today-list');
const upcomingList = document.querySelector('#upcoming-list');
const modal = document.querySelector('#appointment-modal');
let selectedAppointment = null;

const todayState = document.querySelector('#today-state');
const upcomingState = document.querySelector('#upcoming-state');
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

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
	if (!selectedAppointment || !window.confirm(`¿Borrar la cita de ${selectedAppointment.client}?`)) return;
	await LashBookStorage.deleteAppointment(selectedAppointment.id);
	modal.hidden = true;
	window.location.reload();
});

LashBookStorage.getAppointments().then((appointments) => {
	const todayAppointments = appointments.filter((appointment) => appointment.date === today);
	const upcomingAppointments = appointments.filter((appointment) => appointment.date > today);
	if (todayAppointments.length) { todayState.remove(); todayAppointments.forEach((appointment) => todayList.append(createAppointmentCard(appointment))); }
	if (upcomingAppointments.length) { upcomingState.remove(); upcomingAppointments.forEach((appointment) => upcomingList.append(createAppointmentCard(appointment))); }
}).catch(() => { upcomingState.textContent = 'No se pudieron cargar las citas.'; });

