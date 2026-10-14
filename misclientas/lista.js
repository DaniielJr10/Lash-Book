const list = document.querySelector('#client-list-items');
const emptyState = document.querySelector('#empty-state');
const clientCount = document.querySelector('#client-count');

const renderClients = (clients) => {
	clientCount.textContent = clients.length;
	if (!clients.length) return;
	emptyState.remove();
	clients.forEach((client) => {
		const card = document.createElement('a');
		card.className = 'client-card';
		card.href = `../clientas/clientas.html?id=${encodeURIComponent(client.id)}`;
		const initial = client.name.trim().charAt(0).toUpperCase();
		card.innerHTML = `<span class="client-avatar">${initial}</span><span class="client-info"><strong>${client.name}</strong><span>${client.phone || 'Sin teléfono registrado'}</span></span><span class="client-arrow" aria-hidden="true">›</span>`;
		list.append(card);
	});
};

LashBookStorage.getClients().then(renderClients).catch(() => {
	emptyState.textContent = 'No se pudieron cargar las clientas.';
});
