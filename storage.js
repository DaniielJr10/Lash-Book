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
		async deleteClient(id) {
			if (!remote) {
				writeLocal(clientsKey, readLocal(clientsKey).filter((client) => client.id !== id));
				return;
			}
			const { error } = await remote.from('clientas').delete().eq('id', id);
			if (error) throw error;
		},
		async getAppointments() {
			if (!remote) return readLocal(appointmentsKey);
			const { data, error } = await remote.from('citas').select('*').order('fecha', { ascending: true }).order('hora', { ascending: true });
			if (error) throw error;
			return data.map((appointment) => ({ ...appointment, client: appointment.clienta_nombre, service: appointment.servicio, date: appointment.fecha, time: appointment.hora, price: appointment.precio, deposit: appointment.anticipo, notes: appointment.notas }));
		},
		async getAppointment(id) {
			if (!id) return null;
			if (!remote) return readLocal(appointmentsKey).find((appointment) => appointment.id === id) || null;
			const { data, error } = await remote.from('citas').select('*').eq('id', id).single();
			if (error) throw error;
			return { ...data, client: data.clienta_nombre, service: data.servicio, date: data.fecha, time: data.hora, price: data.precio, deposit: data.anticipo, notes: data.notas };
		},
		async saveAppointment(appointment) {
			if (!remote) {
				const savedAppointment = { id: createId(), ...appointment, createdAt: new Date().toISOString() };
				const appointments = readLocal(appointmentsKey);
				const index = appointments.findIndex((item) => item.id === appointment.id);
				if (index >= 0) appointments[index] = { ...appointments[index], ...savedAppointment, id: appointment.id };
				else appointments.push(savedAppointment);
				writeLocal(appointmentsKey, appointments);
				return savedAppointment;
			}
		const values = { clienta_nombre: appointment.client, servicio: appointment.service, fecha: appointment.date, hora: appointment.time, duracion: null, precio: appointment.price || null, anticipo: appointment.deposit || null, notas: appointment.notes || null };
		const request = appointment.id
			? remote.from('citas').update(values).eq('id', appointment.id)
			: remote.from('citas').insert(values);
		const { data, error } = await request.select().single();
			if (error) throw error;
			return data;
		},
		async deleteAppointment(id) {
			if (!remote) {
				writeLocal(appointmentsKey, readLocal(appointmentsKey).filter((appointment) => appointment.id !== id));
				return;
			}
			const { error } = await remote.from('citas').delete().eq('id', id);
			if (error) throw error;
		}
	};
})();