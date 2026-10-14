const list = document.querySelector('#client-list-items');
const clientCount = document.querySelector('#client-count');
const searchInput = document.querySelector('#client-search');
let clients = [];

const renderClients = (clients) => {
	clientCount.textContent = clients.length;
	list.replaceChildren();
	if (!clients.length) {
		const emptyState = document.createElement('div');
		emptyState.className = 'empty-state';
		emptyState.textContent = searchInput.value.trim() ? 'No encontramos clientas con esa búsqueda.' : 'Todavía no tienes clientas guardadas.';
		list.append(emptyState);
		return;
	}
	clients.forEach((client) => {
		const card = document.createElement('a');
		card.className = 'client-card';
		card.href = `../clientas/clientas.html?id=${encodeURIComponent(client.id)}`;
		const avatar = document.createElement('span');
		avatar.className = 'client-avatar';
		avatar.textContent = client.name.trim().charAt(0).toUpperCase();
		const info = document.createElement('span');
		info.className = 'client-info';
		const name = document.createElement('strong');
		name.textContent = client.name;
		const phone = document.createElement('span');
		phone.textContent = client.phone || 'Sin teléfono registrado';
		info.append(name, phone);
		const arrow = document.createElement('span');
		arrow.className = 'client-arrow';
		arrow.setAttribute('aria-hidden', 'true');
		arrow.textContent = '›';
		card.append(avatar, info, arrow);
		list.append(card);
	});
};

searchInput.addEventListener('input', () => {
	const query = searchInput.value.trim().toLocaleLowerCase();
	const filteredClients = clients.filter((client) => `${client.name} ${client.phone || ''}`.toLocaleLowerCase().includes(query));
	renderClients(filteredClients);
});

LashBookStorage.getClients().then((loadedClients) => {
	clients = loadedClients;
	renderClients(clients);
}).catch(() => {
	renderClients([]);
	list.querySelector('.empty-state').textContent = 'No se pudieron cargar las clientas.';
});
