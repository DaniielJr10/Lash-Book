import 'package:flutter/material.dart';

import '../../../nucleo/estado/estado_aplicacion.dart';

class PantallaAgenda extends StatelessWidget {
  const PantallaAgenda({super.key});

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorEstado.leer(context);
    final citas = [...estado.citas]..sort((a, b) => a.fecha.compareTo(b.fecha));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Agenda'),
        actions: [
          IconButton(
            onPressed: () => _mostrarFormulario(context),
            icon: const Icon(Icons.add_circle_outline),
            tooltip: 'Nueva cita',
          ),
        ],
      ),
      body: citas.isEmpty
          ? _EstadoAgendaVacio(onAgregar: () => _mostrarFormulario(context))
          : ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
              itemCount: citas.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, indice) {
                final cita = citas[indice];
                final clienta = estado.buscarClienta(cita.clientaId);
                final servicio = estado.buscarServicio(cita.servicioId);
                return Card(
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    leading: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '${cita.fecha.day}/${cita.fecha.month}',
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        Text(
                          cita.hora,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        ),
                      ],
                    ),
                    title: Text(
                      clienta?.nombre ?? 'Clienta no encontrada',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    subtitle: Text(
                      '${servicio?.nombre ?? 'Servicio'} · ${formatoPesos(cita.precio)}\nSaldo: ${formatoPesos(cita.saldo)}',
                    ),
                    isThreeLine: true,
                    trailing: Chip(label: Text(cita.estado)),
                    onTap: () => _mostrarDetalleCita(context, cita),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _mostrarFormulario(context),
        icon: const Icon(Icons.add),
        label: const Text('Nueva cita'),
      ),
    );
  }

  Future<void> _mostrarFormulario(BuildContext context) async {
    final estado = ProveedorEstado.leer(context);
    if (estado.clientas.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Primero registra una clienta.')),
      );
      return;
    }

    String clientaId = estado.clientas.first.id;
    String servicioId = estado.servicios.first.id;
    DateTime fecha = DateTime.now();
    TimeOfDay hora = TimeOfDay.now();
    final anticipo = TextEditingController(text: '0');

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) => StatefulBuilder(
        builder: (context, actualizar) => Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            20,
            20,
            MediaQuery.viewInsetsOf(context).bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Nueva cita', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: clientaId,
                decoration: const InputDecoration(labelText: 'Clienta'),
                items: estado.clientas
                    .map(
                      (clienta) => DropdownMenuItem(
                        value: clienta.id,
                        child: Text(clienta.nombre),
                      ),
                    )
                    .toList(),
                onChanged: (valor) => actualizar(() => clientaId = valor!),
              ),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                initialValue: servicioId,
                decoration: const InputDecoration(labelText: 'Servicio'),
                items: estado.servicios
                    .map(
                      (servicio) => DropdownMenuItem(
                        value: servicio.id,
                        child: Text(
                          '${servicio.nombre} · ${formatoPesos(servicio.precio)}',
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (valor) => actualizar(() => servicioId = valor!),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final seleccion = await showDatePicker(
                          context: context,
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(
                            const Duration(days: 365),
                          ),
                          initialDate: fecha,
                        );
                        if (seleccion != null) {
                          actualizar(() => fecha = seleccion);
                        }
                      },
                      icon: const Icon(Icons.event),
                      label: Text('${fecha.day}/${fecha.month}/${fecha.year}'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final seleccion = await showTimePicker(
                          context: context,
                          initialTime: hora,
                        );
                        if (seleccion != null) {
                          actualizar(() => hora = seleccion);
                        }
                      },
                      icon: const Icon(Icons.schedule),
                      label: Text(hora.format(context)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              TextField(
                controller: anticipo,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Anticipo recibido',
                  prefixText: '\$ ',
                ),
              ),
              const SizedBox(height: 18),
              FilledButton(
                onPressed: () {
                  final valor = int.tryParse(anticipo.text) ?? 0;
                  final servicio = estado.buscarServicio(servicioId)!;
                  if (valor < 0 || valor > servicio.precio) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'El anticipo debe estar entre cero y el precio del servicio.',
                        ),
                      ),
                    );
                    return;
                  }
                  estado.agregarCita(
                    clientaId: clientaId,
                    servicioId: servicioId,
                    fecha: fecha,
                    hora: hora.format(context),
                    anticipo: valor,
                  );
                  Navigator.pop(context);
                },
                child: const Text('Guardar cita'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _mostrarDetalleCita(BuildContext context, Cita cita) async {
    final estado = ProveedorEstado.leer(context);
    final abono = TextEditingController();
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.fromLTRB(
          20,
          20,
          20,
          MediaQuery.viewInsetsOf(context).bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Detalle de cita',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            Text('Precio acordado: ${formatoPesos(cita.precio)}'),
            Text('Pagado: ${formatoPesos(cita.anticipo)}'),
            Text('Saldo: ${formatoPesos(cita.saldo)}'),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: cita.estado,
              decoration: const InputDecoration(labelText: 'Estado de la cita'),
              items:
                  const ['Confirmada', 'Realizada', 'Cancelada', 'No asistió']
                      .map(
                        (valor) =>
                            DropdownMenuItem(value: valor, child: Text(valor)),
                      )
                      .toList(),
              onChanged: (valor) {
                if (valor != null) estado.cambiarEstadoCita(cita.id, valor);
              },
            ),
            const SizedBox(height: 12),
            if (cita.saldo > 0) ...[
              TextField(
                controller: abono,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Registrar pago adicional',
                  prefixText: '\$ ',
                ),
              ),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: () {
                  final valor = int.tryParse(abono.text) ?? 0;
                  if (!estado.agregarPago(citaId: cita.id, valor: valor)) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'El pago debe ser mayor que cero y no superar el saldo.',
                        ),
                      ),
                    );
                    return;
                  }
                  Navigator.pop(context);
                },
                icon: const Icon(Icons.payments_outlined),
                label: const Text('Registrar pago'),
              ),
            ] else
              const Text(
                'Esta cita está pagada completamente.',
                style: TextStyle(color: Colors.green),
              ),
          ],
        ),
      ),
    );
  }
}

class _EstadoAgendaVacio extends StatelessWidget {
  const _EstadoAgendaVacio({required this.onAgregar});
  final VoidCallback onAgregar;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.calendar_month_outlined,
              size: 64,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'Tu agenda está libre',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            const Text(
              'Crea una cita para comenzar a organizar tu día.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: onAgregar,
              icon: const Icon(Icons.add),
              label: const Text('Crear cita'),
            ),
          ],
        ),
      ),
    );
  }
}
