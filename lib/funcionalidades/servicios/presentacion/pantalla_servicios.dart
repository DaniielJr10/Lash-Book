import 'package:flutter/material.dart';

import '../../../nucleo/estado/estado_aplicacion.dart';

class PantallaServicios extends StatelessWidget {
  const PantallaServicios({super.key});

  @override
  Widget build(BuildContext context) {
    final estado = ProveedorEstado.leer(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Servicios')),
      body: ListView.separated(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
        itemCount: estado.servicios.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (context, indice) {
          final servicio = estado.servicios[indice];
          return Card(
            child: ListTile(
              leading: CircleAvatar(
                child: Icon(
                  servicio.activo
                      ? Icons.auto_awesome
                      : Icons.visibility_off_outlined,
                ),
              ),
              title: Text(
                servicio.nombre,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              subtitle: Text(
                '${formatoPesos(servicio.precio)} · ${servicio.duracion} minutos',
              ),
              trailing: Switch(
                value: servicio.activo,
                onChanged: (_) => estado.cambiarEstadoServicio(servicio.id),
              ),
              onTap: () => _mostrarFormulario(context, servicio: servicio),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _mostrarFormulario(context),
        icon: const Icon(Icons.add),
        label: const Text('Nuevo servicio'),
      ),
    );
  }

  Future<void> _mostrarFormulario(
    BuildContext context, {
    Servicio? servicio,
  }) async {
    final nombre = TextEditingController(text: servicio?.nombre ?? '');
    final precio = TextEditingController(
      text: servicio?.precio.toString() ?? '',
    );
    final duracion = TextEditingController(
      text: servicio?.duracion.toString() ?? '',
    );
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
                servicio == null ? 'Nuevo servicio' : 'Editar servicio',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: nombre,
                decoration: const InputDecoration(labelText: 'Nombre'),
                validator: (texto) => texto == null || texto.trim().isEmpty
                    ? 'Escribe el nombre'
                    : null,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: precio,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Precio',
                  prefixText: '\$ ',
                ),
                validator: (texto) => int.tryParse(texto ?? '') == null
                    ? 'Escribe un precio válido'
                    : null,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: duracion,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Duración en minutos',
                ),
                validator: (texto) => int.tryParse(texto ?? '') == null
                    ? 'Escribe una duración válida'
                    : null,
              ),
              const SizedBox(height: 18),
              FilledButton(
                onPressed: () {
                  if (!formulario.currentState!.validate()) return;
                  final estado = ProveedorEstado.leer(context);
                  if (servicio == null) {
                    estado.agregarServicio(
                      nombre: nombre.text.trim(),
                      precio: int.parse(precio.text),
                      duracion: int.parse(duracion.text),
                    );
                  } else {
                    estado.actualizarServicio(
                      id: servicio.id,
                      nombre: nombre.text.trim(),
                      precio: int.parse(precio.text),
                      duracion: int.parse(duracion.text),
                    );
                  }
                  Navigator.pop(context);
                },
                child: const Text('Guardar servicio'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
