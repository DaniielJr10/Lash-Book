const recordsList = document.querySelector('#records-list');
const recordsState = document.querySelector('#records-state');
const recordCount = document.querySelector('#record-count');

const formatAmount = (amount) => `$${Number(amount || 0).toLocaleString('es-CO')}`;
const formatDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

const createRecordCard = (appointment) => {
	const price = Number(appointment.price) || 0;
	const card = document.createElement('article');
	card.className = 'record-card';
	card.innerHTML = `<span class="record-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></span><span class="record-info"><strong>${appointment.client}</strong><span class="record-meta">${appointment.service} · ${formatDate(appointment.date)}</span></span><span class="record-amount"><strong>${formatAmount(price)}</strong></span>`;
	return card;
};

LashBookStorage.getAppointments().then((appointments) => {
	const withIncome = appointments
		.filter((appointment) => Number(appointment.price) > 0)
		.sort((first, second) => second.date.localeCompare(first.date));

	const totalIncome = withIncome.reduce((total, appointment) => total + (Number(appointment.price) || 0), 0);
	const average = withIncome.length ? Math.round(totalIncome / withIncome.length) : 0;

	document.querySelector('#total-income').textContent = formatAmount(totalIncome);
	document.querySelector('#total-appointments').textContent = withIncome.length;
	document.querySelector('#average-income').textContent = formatAmount(average);
	recordCount.textContent = withIncome.length;

	if (withIncome.length) {
		recordsState.remove();
		withIncome.forEach((appointment) => recordsList.append(createRecordCard(appointment)));
	}
}).catch(() => {
	recordsState.textContent = 'No se pudieron cargar tus finanzas.';
});
