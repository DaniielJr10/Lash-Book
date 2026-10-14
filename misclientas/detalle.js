const clientId = new URLSearchParams(window.location.search).get('id');
const content = document.querySelector('#client-content');
const loading = document.querySelector('#loading');
const errorState = document.querySelector('#error-state');
const deleteModal = document.querySelector('#delete-modal');
let client = null;

const valueOrDash = (value) => value || 'Sin registrar';
const drawSavedMap = (canvas, strokes) => {
	const context = canvas.getContext('2d');
	context.strokeStyle = '#FF5D8F';
	context.lineWidth = 2.2;
	context.lineCap = 'round';
	context.lineJoin = 'round';
	(strokes || []).forEach((stroke) => {
		if (stroke.length < 2) return;
		context.beginPath();
		context.moveTo(stroke[0].x * canvas.width, stroke[0].y * canvas.height);
		stroke.slice(1).forEach((point) => context.lineTo(point.x * canvas.width, point.y * canvas.height));
		context.stroke();
	});
};
const setValues = (selector, values) => {
	document.querySelector(selector).innerHTML = values.map(([label, value]) => `<span>${label}<strong>${valueOrDash(value)}</strong></span>`).join('');
};

const loadClient = async () => {
	if (!clientId) throw new Error('Missing client id');
	client = await LashBookStorage.getClient(clientId);
	if (!client) throw new Error('Client not found');
	const health = client.health || {};
	const design = client.design || {};
	const map = client.map || {};
	document.querySelector('#client-avatar').textContent = client.name.trim().charAt(0).toUpperCase();
	document.querySelector('#client-name').textContent = client.name;
	document.querySelector('#client-contact').textContent = client.phone || 'Sin teléfono registrado';
	document.querySelector('#client-last-appointment').textContent = client.lastAppointment ? `Última cita: ${client.lastAppointment}` : 'Última cita: Sin registrar';
	setValues('#health-values', [['Forma del ojo', health.eyeShape], ['Tamaño', health.eyeSize], ['Curvatura natural', health.naturalCurl], ['Largo natural', health.naturalLength], ['Grosor natural', health.naturalThickness]]);
	setValues('#design-values', [['Técnica', design.technique], ['Largo', design.length], ['Curvatura', design.curl], ['Grosor', design.thickness], ['Estilo de diseño', design.style]]);
	document.querySelector('#left-map').textContent = map.left ? `Zona ${map.left}` : 'Sin seleccionar';
	document.querySelector('#right-map').textContent = map.right ? `Zona ${map.right}` : 'Sin seleccionar';
	if (Array.isArray(map.left)) { document.querySelector('#left-map').textContent = map.left.length ? 'Dibujo guardado' : 'Sin dibujo'; drawSavedMap(document.querySelector('#left-map-canvas'), map.left); }
	if (Array.isArray(map.right)) { document.querySelector('#right-map').textContent = map.right.length ? 'Dibujo guardado' : 'Sin dibujo'; drawSavedMap(document.querySelector('#right-map-canvas'), map.right); }
	document.querySelector('#client-notes').textContent = client.notes || 'Sin notas adicionales.';
	document.querySelector('#edit-client').href = `../clientas/clientas.html?id=${encodeURIComponent(client.id)}`;
	loading.hidden = true;
	content.hidden = false;
};

const closeDelete = () => { deleteModal.hidden = true; };
document.querySelector('#delete-client').addEventListener('click', () => {
	document.querySelector('#delete-message').textContent = `Se eliminará toda la información de ${client.name}.`;
	deleteModal.hidden = false;
});
document.querySelector('#cancel-delete').addEventListener('click', closeDelete);
document.querySelectorAll('[data-close-delete]').forEach((item) => item.addEventListener('click', closeDelete));
document.querySelector('#confirm-delete').addEventListener('click', async () => {
	const button = document.querySelector('#confirm-delete');
	button.disabled = true;
	button.textContent = 'Eliminando...';
	try { await LashBookStorage.deleteClient(client.id); window.location.href = 'mis.html'; }
	finally { button.disabled = false; button.textContent = 'Eliminar'; }
});

loadClient().catch(() => { loading.hidden = true; errorState.hidden = false; });
