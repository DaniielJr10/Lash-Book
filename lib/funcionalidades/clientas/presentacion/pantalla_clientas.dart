import 'package:flutter/material.dart';

import '../../../funcionalidades/fichas_tecnicas/presentacion/pantalla_ficha_tecnica.dart';
import '../../../funcionalidades/mappings/presentacion/pantalla_mapping.dart';
import '../../../nucleo/estado/estado_aplicacion.dart';

class PantallaClientas extends StatefulWidget {
  const PantallaClientas({super.key});

  @override
  State<PantallaClientas> createState() => _EstadoPantallaClientas();
}

class _EstadoPantallaClientas extends State<PantallaClientas> {
  String filtro = '';

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorEstado.leer(context);
    final clientas = estado.clientas
        .where(
          (clienta) =>
              clienta.nombre.toLowerCase().contains(filtro.toLowerCase()) ||
              clienta.telefono.contains(filtro),
        )
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Clientas'),
        actions: [
          IconButton(
            onPressed: () => _mostrarFormulario(context),
            icon: const Icon(Icons.person_add_alt_1),
            tooltip: 'Agregar clienta',
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
            child: TextField(
              onChanged: (valor) => setState(() => filtro = valor),
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: 'Buscar por nombre o teléfono',
              ),
            ),
          ),
          Expanded(
            child: clientas.isEmpty
                ? _EstadoVacio(onAgregar: () => _mostrarFormulario(context))
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                    itemCount: clientas.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, indice) {
                      final clienta = clientas[indice];
                      return Card(
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 6,
                          ),
                          leading: CircleAvatar(
                            child: Text(
                              clienta.nombre.substring(0, 1).toUpperCase(),
                            ),
                          ),
                          title: Text(
                            clienta.nombre,
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          subtitle: Text(clienta.telefono),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => _mostrarDetalle(context, clienta),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _mostrarFormulario(context),
        icon: const Icon(Icons.add),
        label: const Text('Nueva clienta'),
      ),
    );
  }

  Future<void> _mostrarFormulario(BuildContext context) async {
    final nombre = TextEditingController();
    final telefono = TextEditingController();
    final notas = TextEditingController();
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
                'Nueva clienta',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: nombre,
                autofocus: true,
                decoration: const InputDecoration(labelText: 'Nombre completo'),
                validator: (valor) => valor == null || valor.trim().isEmpty
                    ? 'Escribe el nombre'
                    : null,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: telefono,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Teléfono'),
                validator: (valor) => valor == null || valor.trim().isEmpty
                    ? 'Escribe el teléfono'
                    : null,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: notas,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Notas (opcional)',
                ),
              ),
              const SizedBox(height: 18),
              FilledButton(
                onPressed: () {
                  if (formulario.currentState!.validate()) {
                    ProveedorEstado.leer(context).agregarClienta(
                      nombre: nombre.text.trim(),
                      telefono: telefono.text.trim(),
                      notas: notas.text.trim(),
                    );
                    Navigator.pop(context);
                  }
                },
                child: const Text('Guardar clienta'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _mostrarDetalle(BuildContext context, Clienta clienta) {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(clienta.nombre),
        content: Text(
          'Teléfono: ${clienta.telefono}\n\n${clienta.notas.isEmpty ? 'Sin notas registradas.' : clienta.notas}',
        ),
        actions: [
          TextButton.icon(
            onPressed: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => PantallaFichaTecnica(clienta: clienta),
                ),
              );
            },
            icon: const Icon(Icons.description_outlined),
            label: const Text('Ficha'),
          ),
          TextButton.icon(
            onPressed: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => PantallaMapping(clienta: clienta),
                ),
              );
            },
            icon: const Icon(Icons.gesture),
            label: const Text('Mapping'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }
}

class _EstadoVacio extends StatelessWidget {
  const _EstadoVacio({required this.onAgregar});

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
              Icons.people_outline,
              size: 64,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'Aún no tienes clientas',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            const Text(
              'Registra tu primera clienta para comenzar su historial.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: onAgregar,
              icon: const Icon(Icons.add),
              label: const Text('Agregar clienta'),
            ),
          ],
        ),
      ),
    );
  }
}
