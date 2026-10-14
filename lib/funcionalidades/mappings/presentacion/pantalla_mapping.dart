import 'package:flutter/material.dart';

import '../../../nucleo/estado/estado_aplicacion.dart';

class PantallaMapping extends StatefulWidget {
  const PantallaMapping({required this.clienta, super.key});

  final Clienta clienta;

  @override
  State<PantallaMapping> createState() => _EstadoPantallaMapping();
}

class _EstadoPantallaMapping extends State<PantallaMapping> {
  late List<TrazoMapping> trazos;
  List<Offset> trazoActual = [];

  @override
  void initState() {
    super.initState();
    final guardados =
        ProveedorEstado.leer(
          context,
          escuchar: false,
        ).mappings[widget.clienta.id] ??
        [];
    trazos = List<TrazoMapping>.from(guardados);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Mapping · ${widget.clienta.nombre}'),
        actions: [
          IconButton(
            onPressed: _deshacer,
            icon: const Icon(Icons.undo),
            tooltip: 'Deshacer',
          ),
          IconButton(
            onPressed: _limpiar,
            icon: const Icon(Icons.delete_sweep_outlined),
            tooltip: 'Limpiar',
          ),
        ],
      ),
      body: Column(
        children: [
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'Dibuja el diseño sobre el lienzo. Los trazos se guardan durante esta sesión.',
              textAlign: TextAlign.center,
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: ColoredBox(
                  color: Colors.white,
                  child: GestureDetector(
                    onPanStart: (detalle) =>
                        setState(() => trazoActual = [detalle.localPosition]),
                    onPanUpdate: (detalle) => setState(
                      () =>
                          trazoActual = [...trazoActual, detalle.localPosition],
                    ),
                    onPanEnd: (_) {
                      if (trazoActual.length > 1) {
                        setState(() {
                          trazos.add(
                            TrazoMapping(
                              trazoActual,
                              Theme.of(context).colorScheme.primary,
                              3,
                            ),
                          );
                          trazoActual = [];
                        });
                      }
                    },
                    child: CustomPaint(
                      painter: _PintorMapping(
                        trazos: trazos,
                        trazoActual: trazoActual,
                      ),
                      child: const SizedBox.expand(),
                    ),
                  ),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            child: FilledButton.icon(
              onPressed: _guardar,
              icon: const Icon(Icons.save_outlined),
              label: const Text('Guardar mapping'),
            ),
          ),
        ],
      ),
    );
  }

  void _deshacer() {
    if (trazos.isEmpty) return;
    setState(() => trazos.removeLast());
  }

  void _limpiar() {
    if (trazos.isEmpty) return;
    setState(() {
      trazos.clear();
      trazoActual = [];
    });
  }

  void _guardar() {
    ProveedorEstado.leer(
      context,
      escuchar: false,
    ).guardarMapping(widget.clienta.id, trazos);
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Mapping guardado')));
  }
}

class _PintorMapping extends CustomPainter {
  const _PintorMapping({required this.trazos, required this.trazoActual});

  final List<TrazoMapping> trazos;
  final List<Offset> trazoActual;

  @override
  void paint(Canvas canvas, Size size) {
    final plantilla = Paint()
      ..color = Colors.black12
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    final centro = Offset(size.width / 2, size.height / 2);
    canvas.drawOval(
      Rect.fromCenter(
        center: centro,
        width: size.width * .8,
        height: size.height * .45,
      ),
      plantilla,
    );
    canvas.drawLine(
      Offset(size.width * .1, centro.dy),
      Offset(size.width * .9, centro.dy),
      plantilla,
    );
    for (final trazo in [
      ...trazos,
      if (trazoActual.isNotEmpty) TrazoMapping(trazoActual, Colors.black87, 3),
    ]) {
      final pintura = Paint()
        ..color = trazo.color
        ..strokeWidth = trazo.grosor
        ..strokeCap = StrokeCap.round
        ..style = PaintingStyle.stroke;
      for (var indice = 1; indice < trazo.puntos.length; indice++) {
        canvas.drawLine(
          trazo.puntos[indice - 1],
          trazo.puntos[indice],
          pintura,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant _PintorMapping oldDelegate) =>
      oldDelegate.trazos != trazos || oldDelegate.trazoActual != trazoActual;
}
