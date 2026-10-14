const LashBookStorage = (() => {
	const clientsKey = 'lash-book-clients';
	const appointmentsKey = 'lash-book-appointments';
	const supabaseUrl = 'https://oyeqsofuddradawezsil.supabase.co';
	const supabaseKey = 'sb_publishable_4bGgC8_LnGQ97ebYCUGYrw_8Qxr1LAf';
	const remote = window.supabase?.createClient(supabaseUrl, supabaseKey);

	const readLocal = (key) => {
		try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
	};
	const writeLocal = (key, value) => localStorage.setItem(key, JSON.stringify(value));
	const createId = () => window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

	return {
		async getClients() {
			if (!remote) return readLocal(clientsKey);
			const { data, error } = await remote.from('clientas').select('*').order('created_at', { ascending: false });
			if (error) throw error;
			return data.map((client) => ({ ...client, name: client.nombre, phone: client.telefono, lastAppointment: client.ultima_cita, health: client.salud, design: client.diseno, map: client.mapeo }));
		},
		async getClient(id) {
			if (!id) return null;
			if (!remote) return readLocal(clientsKey).find((client) => client.id === id) || null;
			const { data, error } = await remote.from('clientas').select('*').eq('id', id).single();
			if (error) throw error;
			return { ...data, name: data.nombre, phone: data.telefono, lastAppointment: data.ultima_cita, health: data.salud, design: data.diseno, map: data.mapeo, notes: data.notas };
		},
		async saveClient(client) {
			if (!remote) {
				const savedClient = { id: client.id || createId(), ...client, updatedAt: new Date().toISOString() };
				const clients = readLocal(clientsKey);
				const index = clients.findIndex((item) => item.id === savedClient.id);
				if (index >= 0) clients[index] = savedClient;
				else clients.push(savedClient);
				writeLocal(clientsKey, clients);
				return savedClient;
			}
		const values = { nombre: client.name, telefono: client.phone || null, ultima_cita: client.lastAppointment || null, salud: client.health, diseno: client.design, mapeo: client.map, notas: client.notes || null, updated_at: new Date().toISOString() };
		const request = client.id
			? remote.from('clientas').update(values).eq('id', client.id)
			: remote.from('clientas').insert(values);
		const { data, error } = await request.select().single();
			if (error) throw error;
			return data;
		},
		async getAppointments() {
			if (!remote) return readLocal(appointmentsKey);
			const { data, error } = await remote.from('citas').select('*').order('fecha', { ascending: true }).order('hora', { ascending: true });
			if (error) throw error;
			return data.map((appointment) => ({ ...appointment, client: appointment.clienta_nombre, service: appointment.servicio, date: appointment.fecha, time: appointment.hora }));
		},
		async saveAppointment(appointment) {
			if (!remote) {
				const savedAppointment = { id: createId(), ...appointment, createdAt: new Date().toISOString() };
				writeLocal(appointmentsKey, [...readLocal(appointmentsKey), savedAppointment]);
				return savedAppointment;
			}
			const { data, error } = await remote.from('citas').insert({ clienta_nombre: appointment.client, servicio: appointment.service, fecha: appointment.date, hora: appointment.time, duracion: appointment.duration || null, precio: appointment.price || null, anticipo: appointment.deposit || null, notas: appointment.notes || null }).select().single();
			if (error) throw error;
			return data;
		}
	};
})();