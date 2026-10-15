const recordsList = document.querySelector('#records-list');
const recordCount = document.querySelector('#record-count');
const historyTitle = document.querySelector('#history-title');
const periodButtons = document.querySelectorAll('.filter-button');
const rangeControls = document.querySelectorAll('.range-control');
const periodMonth = document.querySelector('#period-month');
const periodWeek = document.querySelector('#period-week');
const periodFrom = document.querySelector('#period-from');
const periodTo = document.querySelector('#period-to');
const modal = document.querySelector('#appointment-modal');
const deleteModal = document.querySelector('#delete-modal');
let allAppointments = [];
let selectedAppointment = null;

const formatAmount = (amount) => `$${Number(amount || 0).toLocaleString('es-CO')}`;
const formatDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
const formatLongDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
const formatTime = (time) => {
	if (!time) return '';
	const [hourText, minute] = time.split(':');
	let hour = Number(hourText);
	const period = hour >= 12 ? 'pm' : 'am';
	hour = hour % 12;
	if (hour === 0) hour = 12;
	return `${hour}:${minute} ${period}`;
};
const toISODate = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};
const getDefaultMonth = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
const getWeekStart = (dateValue) => {
	const date = new Date(`${dateValue}T12:00:00`);
	const day = (date.getDay() + 6) % 7;
	const monday = new Date(date);
	monday.setDate(date.getDate() - day);
	return monday;
};
const getWeekRange = (dateValue) => {
	const start = getWeekStart(dateValue);
	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	return { start: toISODate(start), end: toISODate(end) };
};
const getCurrentRangeLabel = () => {
	const monthValue = periodMonth.value || getDefaultMonth();
	const weekValue = periodWeek.value || toISODate(new Date());
	if (document.querySelector('.filter-button.is-active')?.dataset.range === 'month') {
		const [year, month] = monthValue.split('-');
		const monthLabel = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
		return `Historial de ingresos de ${monthLabel}`;
	}
	if (document.querySelector('.filter-button.is-active')?.dataset.range === 'week') {
		const { start, end } = getWeekRange(weekValue);
		return `Ingresos de la semana ${formatDate(start)} - ${formatDate(end)}`;
	}
	const fromDate = periodFrom.value || toISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
	const toDate = periodTo.value || toISODate(new Date());
	return `Ingresos del ${formatDate(fromDate)} al ${formatDate(toDate)}`;
};
const openAppointmentDetail = (appointment) => {
	selectedAppointment = appointment;
	document.querySelector('#detail-title').textContent = appointment.service;
	document.querySelector('#detail-date').textContent = `${formatLongDate(appointment.date)} · ${formatTime(appointment.time)}`;
	document.querySelector('#detail-client').textContent = appointment.client;
	document.querySelector('#detail-service').textContent = appointment.service;
	document.querySelector('#detail-price').textContent = appointment.price ? `$${Number(appointment.price).toLocaleString('es-CO')}` : 'Sin registrar';
	document.querySelector('#detail-notes').textContent = appointment.notes || 'Sin notas adicionales.';
	modal.hidden = false;
};
const closeModal = () => { modal.hidden = true; };
const closeDeleteModal = () => { deleteModal.hidden = true; };

const createRecordCard = (appointment) => {
	const price = Number(appointment.price) || 0;
	const card = document.createElement('button');
	card.type = 'button';
	card.className = 'record-card';
	card.dataset.id = appointment.id;
	const initial = (appointment.client || 'A').trim().charAt(0).toUpperCase();
	card.innerHTML = `<span class="record-icon" aria-hidden="true">${initial}</span><span class="record-info"><strong>${appointment.client}</strong><span class="record-meta">${appointment.service} · ${formatDate(appointment.date)}</span></span><span class="record-amount"><strong>${formatAmount(price)}</strong></span>`;
	card.addEventListener('click', () => openAppointmentDetail(appointment));
	return card;
};

const updateRangeVisibility = () => {
	const activeRange = document.querySelector('.filter-button.is-active')?.dataset.range || 'month';
	rangeControls.forEach((control) => {
		const isActive = control.dataset.control === activeRange;
		control.classList.toggle('is-hidden', !isActive);
	});
	historyTitle.textContent = getCurrentRangeLabel();
};

const filterAppointments = (appointments) => {
	const activeRange = document.querySelector('.filter-button.is-active')?.dataset.range || 'month';
	if (activeRange === 'month') {
		const monthValue = periodMonth.value || getDefaultMonth();
		return appointments.filter((appointment) => appointment.date.startsWith(monthValue));
	}
	if (activeRange === 'week') {
		const { start, end } = getWeekRange(periodWeek.value || toISODate(new Date()));
		return appointments.filter((appointment) => appointment.date >= start && appointment.date <= end);
	}
	const fromDate = periodFrom.value || toISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
	const toDate = periodTo.value || toISODate(new Date());
	return appointments.filter((appointment) => appointment.date >= fromDate && appointment.date <= toDate);
};

const renderFinanceOverview = () => {
	const selectedAppointments = filterAppointments(allAppointments)
		.slice()
		.sort((first, second) => first.client.localeCompare(second.client, 'es', { sensitivity: 'base' }));

	const incomeAppointments = selectedAppointments.filter((appointment) => Number(appointment.price) > 0);
	const totalIncome = incomeAppointments.reduce((total, appointment) => total + (Number(appointment.price) || 0), 0);

	document.querySelector('#total-income').textContent = formatAmount(totalIncome);
	recordCount.textContent = selectedAppointments.length;
	historyTitle.textContent = getCurrentRangeLabel();

	recordsList.innerHTML = '';
	if (!selectedAppointments.length) {
		recordsList.innerHTML = '<div class="empty-state" id="records-state">No hay ingresos en este rango.</div>';
		return;
	}
	selectedAppointments.forEach((appointment) => recordsList.append(createRecordCard(appointment)));
};

periodButtons.forEach((button) => {
	button.addEventListener('click', () => {
		periodButtons.forEach((item) => item.classList.toggle('is-active', item === button));
		updateRangeVisibility();
		renderFinanceOverview();
	});
});

[periodMonth, periodWeek, periodFrom, periodTo].forEach((input) => {
	input.addEventListener('input', renderFinanceOverview);
});

const setDefaultPeriodValues = () => {
	const today = new Date();
	periodMonth.value = getDefaultMonth();
	periodWeek.value = toISODate(today);
	const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
	const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
	periodFrom.value = toISODate(firstDay);
	periodTo.value = toISODate(lastDay);
	updateRangeVisibility();
};

document.querySelectorAll('[data-close-modal]').forEach((element) => {
	element.addEventListener('click', closeModal);
});

document.querySelector('#edit-appointment').addEventListener('click', () => {
	if (!selectedAppointment) return;
	window.location.href = `../agendar_cita/agendar.html?id=${encodeURIComponent(selectedAppointment.id)}`;
});

document.querySelector('#delete-appointment').addEventListener('click', () => {
	if (!selectedAppointment) return;
	document.querySelector('#delete-message').textContent = `La cita de ${selectedAppointment.client} se eliminará de tu agenda.`;
	deleteModal.hidden = false;
});

document.querySelectorAll('[data-close-delete]').forEach((element) => {
	element.addEventListener('click', closeDeleteModal);
});

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
	allAppointments = appointments;
	setDefaultPeriodValues();
	renderFinanceOverview();
}).catch(() => {
	recordsList.innerHTML = '<div class="empty-state" id="records-state">No se pudieron cargar tus finanzas.</div>';
	historyTitle.textContent = 'No se pudieron cargar tus finanzas';
});
