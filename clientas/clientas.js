const form = document.querySelector('#client-form');
const toast = document.querySelector('#toast');
const mapZones = document.querySelectorAll('.map-zone');
const selectedLabels = document.querySelectorAll('.selected-zone');
const clearMap = document.querySelector('#clear-map');
const clientId = new URLSearchParams(window.location.search).get('id');
let toastTimer;

const getMapValue = (eye) => {
		const selectedZone = document.querySelector(`[data-eye="${eye}"] .map-zone.active`);
		return selectedZone ? selectedZone.dataset.zone : '';
};

mapZones.forEach((zone) => {
	zone.addEventListener('click', () => {
		const eye = zone.closest('.eye-shape').dataset.eye;
		zone.closest('.eye-shape').querySelectorAll('.map-zone').forEach((item) => item.classList.remove('active'));
		zone.classList.add('active');
		document.querySelector(`[data-selected="${eye}"]`).textContent = `Zona ${zone.dataset.zone} seleccionada`;
	});
});

clearMap.addEventListener('click', () => {
	mapZones.forEach((zone) => zone.classList.remove('active'));
	selectedLabels.forEach((label) => { label.textContent = 'Sin seleccionar'; });
});

const setRadioValue = (name, value) => {
	if (!value) return;
	const option = document.querySelector(`input[name="${name}"][value="${value}"]`);
	if (option) option.checked = true;
};

const loadClient = async () => {
	if (!clientId) return;
	const client = await LashBookStorage.getClient(clientId);
	if (!client) return;
	const health = client.health || {};
	const design = client.design || {};
	const map = client.map || {};
	document.querySelector('#client-name').value = client.name || '';
	document.querySelector('#client-phone').value = client.phone || '';
	document.querySelector('#client-date').value = client.lastAppointment || '';
	document.querySelector('#technique').value = design.technique || '';
	document.querySelector('#length').value = design.length || '';
	document.querySelector('#curl').value = design.curl || '';
	document.querySelector('#thickness').value = design.thickness || '';
	document.querySelector('#style').value = design.style || '';
	document.querySelector('#client-notes').value = client.notes || '';
	setRadioValue('eye-shape', health.eyeShape);
	setRadioValue('eye-size', health.eyeSize);
	setRadioValue('natural-curl', health.naturalCurl);
	setRadioValue('natural-length', health.naturalLength);
	setRadioValue('natural-thickness', health.naturalThickness);
	['left', 'right'].forEach((eye) => {
		const zone = document.querySelector(`[data-eye="${eye}"] .map-zone[data-zone="${map[eye]}"]`);
		if (zone) {
			zone.classList.add('active');
			document.querySelector(`[data-selected="${eye}"]`).textContent = `Zona ${map[eye]} seleccionada`;
		}
	});
};

loadClient().catch(() => {
	toast.textContent = 'No se pudo cargar la información de la clienta.';
	toast.classList.add('is-visible');
});

form.addEventListener('submit', async (event) => {
	event.preventDefault();
	if (!form.reportValidity()) return;
	const formData = new FormData(form);
	await LashBookStorage.saveClient({
		id: clientId || undefined,
		name: formData.get('client-name').trim(),
		phone: formData.get('client-phone').trim(),
		lastAppointment: formData.get('client-date'),
		health: {
			eyeShape: formData.get('eye-shape'),
			eyeSize: formData.get('eye-size'),
			naturalCurl: formData.get('natural-curl'),
			naturalLength: formData.get('natural-length'),
			naturalThickness: formData.get('natural-thickness')
		},
		design: {
			technique: formData.get('technique').trim(),
			length: formData.get('length').trim(),
			curl: formData.get('curl').trim(),
			thickness: formData.get('thickness').trim(),
			style: formData.get('style').trim()
		},
		map: { left: getMapValue('left'), right: getMapValue('right') },
		notes: formData.get('client-notes').trim()
	});
	toast.textContent = 'Clienta guardada correctamente.';
	toast.classList.add('is-visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => { window.location.href = '../misclientas/mis.html'; }, 900);
});

document.querySelector('#save-client').addEventListener('click', () => form.requestSubmit());
