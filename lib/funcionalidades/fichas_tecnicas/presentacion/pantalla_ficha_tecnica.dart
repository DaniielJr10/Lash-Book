import 'package:flutter/material.dart';

import '../../../nucleo/estado/estado_aplicacion.dart';

class PantallaFichaTecnica extends StatefulWidget {
  const PantallaFichaTecnica({required this.clienta, super.key});

  final Clienta clienta;

  @override
  State<PantallaFichaTecnica> createState() => _EstadoPantallaFichaTecnica();
}

class _EstadoPantallaFichaTecnica extends State<PantallaFichaTecnica> {
  late final Map<String, TextEditingController> controles;

  @override
  void initState() {
    super.initState();
    final ficha = ProveedorEstado.leer(
      context,
      escuchar: false,
    ).fichasTecnicas[widget.clienta.id];
    controles = {
      'estado': TextEditingController(text: ficha?.estadoPestanas ?? ''),
      'ojos': TextEditingController(text: ficha?.formaOjos ?? ''),
      'tecnica': TextEditingController(text: ficha?.tecnica ?? ''),
      'diseno': TextEditingController(text: ficha?.diseno ?? ''),
      'longitudes': TextEditingController(text: ficha?.longitudes ?? ''),
      'grosor': TextEditingController(text: ficha?.grosor ?? ''),
      'curvatura': TextEditingController(text: ficha?.curvatura ?? ''),
      'sensibilidades': TextEditingController(
        text: ficha?.sensibilidades ?? '',
      ),
      'observaciones': TextEditingController(text: ficha?.observaciones ?? ''),
    };
  }

  @override
  void dispose() {
    for (final control in controles.values) {
      control.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Ficha de ${widget.clienta.nombre}')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        children: [
          const Text(
            'Características naturales',
            style: TextStyle(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 10),
          _campo('estado', 'Estado de pestañas naturales'),
          _campo('ojos', 'Forma de los ojos'),
          const SizedBox(height: 12),
          const Text(
            'Diseño de aplicación',
            style: TextStyle(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 10),
          _campo('tecnica', 'Técnica'),
          _campo('diseno', 'Diseño seleccionado'),
          _campo('longitudes', 'Longitudes utilizadas'),
          _campo('grosor', 'Grosor'),
          _campo('curvatura', 'Curvatura'),
          const SizedBox(height: 12),
          const Text(
            'Información sensible y notas',
            style: TextStyle(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 10),
          _campo(
            'sensibilidades',
            'Sensibilidades o alergias declaradas',
            lineas: 2,
          ),
          _campo('observaciones', 'Observaciones del servicio', lineas: 3),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: _guardar,
            icon: const Icon(Icons.save_outlined),
            label: const Text('Guardar ficha técnica'),
          ),
        ],
      ),
    );
  }

  Widget _campo(String clave, String etiqueta, {int lineas = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextField(
        controller: controles[clave],
        maxLines: lineas,
        decoration: InputDecoration(labelText: etiqueta),
      ),
    );
  }

  void _guardar() {
    final estado = ProveedorEstado.leer(context, escuchar: false);
    estado.guardarFichaTecnica(
      FichaTecnica(
        clientaId: widget.clienta.id,
        estadoPestanas: controles['estado']!.text.trim(),
        formaOjos: controles['ojos']!.text.trim(),
        tecnica: controles['tecnica']!.text.trim(),
        diseno: controles['diseno']!.text.trim(),
        longitudes: controles['longitudes']!.text.trim(),
        grosor: controles['grosor']!.text.trim(),
        curvatura: controles['curvatura']!.text.trim(),
        sensibilidades: controles['sensibilidades']!.text.trim(),
        observaciones: controles['observaciones']!.text.trim(),
      ),
    );
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Ficha técnica guardada')));
  }
}
