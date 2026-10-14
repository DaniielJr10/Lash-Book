const form = document.querySelector('#client-form');
const toast = document.querySelector('#toast');
const toastTitle = toast.querySelector('.toast-title');
const toastMessage = toast.querySelector('.toast-message');
const selectedLabels = document.querySelectorAll('.selected-zone');
const clearMap = document.querySelector('#clear-map');
const clientId = new URLSearchParams(window.location.search).get('id');
const canvases = document.querySelectorAll('.eye-canvas');
const drawings = { left: [], right: [] };
let toastTimer;

const redrawCanvas = (canvas, strokes) => {
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.strokeStyle = '#c54f7c';
	context.lineWidth = 2.2;
	context.lineCap = 'round';
	context.lineJoin = 'round';
	strokes.forEach((stroke) => {
		if (stroke.length < 2) return;
		context.beginPath();
		context.moveTo(stroke[0].x * canvas.width, stroke[0].y * canvas.height);
		stroke.slice(1).forEach((point) => context.lineTo(point.x * canvas.width, point.y * canvas.height));
		context.stroke();
	});
};

canvases.forEach((canvas) => {
	const eye = canvas.dataset.eye;
	let currentStroke = null;
	canvas.addEventListener('pointerdown', (event) => {
		canvas.setPointerCapture(event.pointerId);
		canvas.classList.add('is-drawing');
		const bounds = canvas.getBoundingClientRect();
		currentStroke = [{ x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height }];
		drawings[eye].push(currentStroke);
	});
	canvas.addEventListener('pointermove', (event) => {
		if (!currentStroke) return;
		const bounds = canvas.getBoundingClientRect();
		currentStroke.push({ x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height });
		redrawCanvas(canvas, drawings[eye]);
	});
	const stopDrawing = () => { currentStroke = null; canvas.classList.remove('is-drawing'); document.querySelector(`[data-selected="${eye}"]`).textContent = drawings[eye].length ? 'Dibujo listo para guardar' : 'Sin dibujo'; };
	canvas.addEventListener('pointerup', stopDrawing);
	canvas.addEventListener('pointercancel', stopDrawing);
});

clearMap.addEventListener('click', () => {
	canvases.forEach((canvas) => { drawings[canvas.dataset.eye] = []; redrawCanvas(canvas, []); });
	selectedLabels.forEach((label) => { label.textContent = 'Sin dibujo'; });
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
		const savedDrawing = Array.isArray(map[eye]) ? map[eye] : [];
		drawings[eye].push(...savedDrawing);
		const canvas = document.querySelector(`.eye-canvas[data-eye="${eye}"]`);
		redrawCanvas(canvas, drawings[eye]);
		if (savedDrawing.length || (typeof map[eye] === 'string' && map[eye])) document.querySelector(`[data-selected="${eye}"]`).textContent = 'Dibujo guardado';
	});
};

loadClient().catch(() => {
	toastTitle.textContent = 'No se pudo cargar';
	toastMessage.textContent = 'Revisa la conexión e inténtalo nuevamente.';
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
		map: { left: drawings.left, right: drawings.right },
		notes: formData.get('client-notes').trim()
	});
	toastTitle.textContent = clientId ? 'Clienta actualizada' : 'Clienta creada';
	toastMessage.textContent = clientId ? 'Los cambios se guardaron correctamente.' : 'La información se guardó correctamente.';
	toast.classList.add('is-visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => { window.location.href = '../misclientas/mis.html'; }, 900);
});

document.querySelector('#save-client').addEventListener('click', () => form.requestSubmit());
