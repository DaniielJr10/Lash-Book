import 'package:flutter/material.dart';

import '../../../aplicacion/tema/tema_aplicacion.dart';
import '../../../nucleo/estado/estado_aplicacion.dart';

class PantallaInicio extends StatelessWidget {
  const PantallaInicio({super.key});

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorEstado.leer(context);
    final fecha = DateTime.now();
    final fechaFormateada = '${fecha.day} de ${_nombreMes(fecha.month)}';

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
        children: [
          Text(
            'Buenos días, Laura',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: colorTinta,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            fechaFormateada,
            style: TextStyle(color: colorTinta.withValues(alpha: 0.6)),
          ),
          const SizedBox(height: 24),
          Card(
            color: colorRosaSuave,
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  const CircleAvatar(
                    backgroundColor: Colors.white,
                    foregroundColor: colorVerde,
                    child: Icon(Icons.trending_up),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Ingresos del mes'),
                      const SizedBox(height: 4),
                      Text(
                        formatoPesos(estado.ingresos),
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      Text(
                        '${estado.citas.length} citas registradas',
                        style: TextStyle(color: colorVerde),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _IndicadorResumen(
                  titulo: 'Citas hoy',
                  valor: '${estado.citas.length}',
                  icono: Icons.event_available_outlined,
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: _IndicadorResumen(
                  titulo: 'Por cobrar',
                  valor: formatoPesos(estado.pendientes),
                  icono: Icons.account_balance_wallet_outlined,
                ),
              ),
            ],
          ),
          const SizedBox(height: 28),
          Text(
            'Próximas citas',
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          if (estado.citas.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Text('No tienes citas registradas todavía.'),
              ),
            )
          else
            ...estado.citas.take(3).map((cita) {
              final clienta = estado.buscarClienta(cita.clientaId);
              final servicio = estado.buscarServicio(cita.servicioId);
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _CitaResumen(
                  hora: cita.hora,
                  clienta: clienta?.nombre ?? 'Clienta',
                  servicio: servicio?.nombre ?? 'Servicio',
                ),
              );
            }),
        ],
      ),
    );
  }

  String _nombreMes(int mes) {
    const meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    return meses[mes - 1];
  }
}

class _IndicadorResumen extends StatelessWidget {
  const _IndicadorResumen({
    required this.titulo,
    required this.valor,
    required this.icono,
  });

  final String titulo;
  final String valor;
  final IconData icono;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icono, color: colorRosaPrincipal),
            const SizedBox(height: 12),
            Text(valor, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 2),
            Text(titulo, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}

class _CitaResumen extends StatelessWidget {
  const _CitaResumen({
    required this.hora,
    required this.clienta,
    required this.servicio,
  });

  final String hora;
  final String clienta;
  final String servicio;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        leading: Text(
          hora,
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            color: colorRosaPrincipal,
          ),
        ),
        title: Text(
          clienta,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(servicio),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }
}
