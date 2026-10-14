const technicalSheetsButton = document.querySelector('#technical-sheets');
const toast = document.querySelector('#toast');
let toastTimer;

technicalSheetsButton.addEventListener('click', () => {
	toast.textContent = 'Las fichas técnicas estarán disponibles próximamente.';
	toast.classList.add('is-visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
});
