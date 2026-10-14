const form = document.querySelector('#appointment-form');
const toast = document.querySelector('#toast');
let toastTimer;

form.addEventListener('submit', (event) => {
	event.preventDefault();
	if (!form.reportValidity()) return;

	toast.textContent = 'Cita agendada correctamente.';
	toast.classList.add('is-visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		window.location.href = '../inicio.html';
	}, 1200);
});
