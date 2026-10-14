const technicalSheetsButton = document.querySelector('#technical-sheets');
const toast = document.querySelector('#toast');
let toastTimer;

const todayState = document.querySelector('#today-state');
const upcomingState = document.querySelector('#upcoming-state');
const today = new Date().toISOString().slice(0, 10);

LashBookStorage.getAppointments().then((appointments) => {
	const todayAppointments = appointments.filter((appointment) => appointment.date === today);
	if (todayAppointments.length > 0) todayState.textContent = `${todayAppointments.length} cita${todayAppointments.length === 1 ? '' : 's'} agendada${todayAppointments.length === 1 ? '' : 's'} para hoy.`;
	if (appointments.length > 0) {
		const nextAppointment = appointments[0];
		const appointmentDate = new Date(`${nextAppointment.date}T${nextAppointment.time}`);
		const formattedDate = appointmentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
		upcomingState.textContent = `${nextAppointment.client} · ${nextAppointment.service} · ${formattedDate} a las ${nextAppointment.time}.`;
	}
}).catch(() => { upcomingState.textContent = 'No se pudieron cargar las citas.'; });

technicalSheetsButton.addEventListener('click', () => {
	toast.textContent = 'Las fichas técnicas estarán disponibles próximamente.';
	toast.classList.add('is-visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
});
