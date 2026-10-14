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
			return data.map((client) => ({ ...client, name: client.nombre, phone: client.telefono, lastAppointment: client.ultima_cita, health: client.salud, design: client.diseno, map: client.mapeo, notes: client.notas }));
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
				const client = readLocal(clientsKey).find((item) => item.id === id);
				writeLocal(clientsKey, readLocal(clientsKey).filter((item) => item.id !== id));
				if (client) writeLocal(appointmentsKey, readLocal(appointmentsKey).filter((item) => item.client !== client.name));
				return;
			}
			const client = await this.getClient(id);
			if (!client) return;
			const { error: linkedAppointmentsError } = await remote.from('citas').delete().eq('clienta_id', id);
			if (linkedAppointmentsError) throw linkedAppointmentsError;
			const { error: legacyAppointmentsError } = await remote.from('citas').delete().eq('clienta_nombre', client.name);
			if (legacyAppointmentsError) throw legacyAppointmentsError;
			const { error: clientError } = await remote.from('clientas').delete().eq('id', id);
			if (clientError) throw clientError;
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
		async hasAppointmentConflict(appointment) {
			if (!appointment.date || !appointment.time) return false;
			const normalizedTime = appointment.time.length === 5 ? `${appointment.time}:00` : appointment.time;
			if (!remote) {
				return readLocal(appointmentsKey).some((item) => item.date === appointment.date && item.time.slice(0, 5) === normalizedTime.slice(0, 5) && item.id !== appointment.id);
			}
		let request = remote.from('citas').select('id').eq('fecha', appointment.date).eq('hora', normalizedTime);
			if (appointment.id) request = request.neq('id', appointment.id);
			const { data, error } = await request;
			if (error) throw error;
			return data.length > 0;
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
		let clientaId = appointment.clientId || null;
		if (!clientaId) {
			const { data: matchingClient, error: clientLookupError } = await remote.from('clientas').select('id').eq('nombre', appointment.client).limit(1).maybeSingle();
			if (clientLookupError) throw clientLookupError;
			clientaId = matchingClient?.id || null;
		}
		const values = { clienta_id: clientaId, clienta_nombre: appointment.client, servicio: appointment.service, fecha: appointment.date, hora: appointment.time, duracion: null, precio: appointment.price || null, anticipo: appointment.deposit || null, notas: appointment.notes || null };
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