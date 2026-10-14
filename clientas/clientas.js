const form = document.querySelector('#client-form');
const toast = document.querySelector('#toast');
const mapZones = document.querySelectorAll('.map-zone');
const selectedLabels = document.querySelectorAll('.selected-zone');
const clearMap = document.querySelector('#clear-map');
let toastTimer;

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

form.addEventListener('submit', (event) => {
	event.preventDefault();
	if (!form.reportValidity()) return;
	toast.textContent = 'Clienta guardada correctamente.';
	toast.classList.add('is-visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
});

document.querySelector('#save-client').addEventListener('click', () => form.requestSubmit());
