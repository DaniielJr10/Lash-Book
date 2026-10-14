import 'package:flutter/material.dart';

import '../../../nucleo/estado/estado_aplicacion.dart';

class PantallaFinanzas extends StatelessWidget {
  const PantallaFinanzas({super.key});

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorEstado.leer(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Finanzas'),
        actions: [
          IconButton(
            onPressed: () => _mostrarGasto(context),
            icon: const Icon(Icons.receipt_long_outlined),
            tooltip: 'Registrar gasto',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
        children: [
          Row(
            children: [
              Expanded(
                child: _ResumenFinanciero(
                  titulo: 'Recibido',
                  valor: formatoPesos(estado.ingresos),
                  color: Colors.green,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _ResumenFinanciero(
                  titulo: 'Pendiente',
                  valor: formatoPesos(estado.pendientes),
                  color: Colors.orange,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _ResumenFinanciero(
            titulo: 'Gastos registrados',
            valor: formatoPesos(estado.totalGastos),
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(height: 24),
          Text(
            'Movimientos',
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 10),
          if (estado.gastos.isEmpty && estado.citas.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Text(
                  'Aquí aparecerán tus pagos y gastos cuando los registres.',
                ),
              ),
            ),
          ...estado.citas.map(
            (cita) => ListTile(
              leading: const Icon(Icons.arrow_downward, color: Colors.green),
              title: const Text('Anticipo de cita'),
              subtitle: Text(cita.hora),
              trailing: Text(formatoPesos(cita.anticipo)),
            ),
          ),
          ...estado.gastos.map(
            (gasto) => ListTile(
              leading: const Icon(Icons.arrow_upward, color: Colors.red),
              title: Text(gasto.descripcion),
              subtitle: const Text('Gasto'),
              trailing: Text('- ${formatoPesos(gasto.valor)}'),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _mostrarGasto(context),
        icon: const Icon(Icons.add),
        label: const Text('Nuevo gasto'),
      ),
    );
  }

  Future<void> _mostrarGasto(BuildContext context) async {
    final descripcion = TextEditingController();
    final valor = TextEditingController();
    final formulario = GlobalKey<FormState>();
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
        child: Form(
          key: formulario,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Registrar gasto',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: descripcion,
                decoration: const InputDecoration(labelText: 'Descripción'),
                validator: (texto) => texto == null || texto.trim().isEmpty
                    ? 'Escribe una descripción'
                    : null,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: valor,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Valor',
                  prefixText: '\$ ',
                ),
                validator: (texto) {
                  final numero = int.tryParse(texto ?? '');
                  return numero == null || numero <= 0
                      ? 'Escribe un valor válido'
                      : null;
                },
              ),
              const SizedBox(height: 18),
              FilledButton(
                onPressed: () {
                  if (!formulario.currentState!.validate()) return;
                  ProveedorEstado.leer(context).agregarGasto(
                    descripcion: descripcion.text.trim(),
                    valor: int.parse(valor.text),
                  );
                  Navigator.pop(context);
                },
                child: const Text('Guardar gasto'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ResumenFinanciero extends StatelessWidget {
  const _ResumenFinanciero({
    required this.titulo,
    required this.valor,
    required this.color,
  });
  final String titulo;
  final String valor;
  final Color color;

  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.payments_outlined, color: color),
          const SizedBox(height: 10),
          Text(
            valor,
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
          ),
          Text(titulo),
        ],
      ),
    ),
  );
}
