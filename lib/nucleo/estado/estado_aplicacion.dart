import 'package:flutter/material.dart';

class Clienta {
  Clienta({required this.nombre, required this.telefono, this.notas = ''})
    : id = DateTime.now().microsecondsSinceEpoch.toString();

  final String id;
  final String nombre;
  final String telefono;
  final String notas;
}

class Servicio {
  Servicio({required this.nombre, required this.precio, required this.duracion})
    : id = DateTime.now().microsecondsSinceEpoch.toString();

  final String id;
  final String nombre;
  final int precio;
  final int duracion;
  bool activo = true;
}

class FichaTecnica {
  FichaTecnica({
    required this.clientaId,
    required this.estadoPestanas,
    required this.formaOjos,
    required this.tecnica,
    required this.diseno,
    required this.longitudes,
    required this.grosor,
    required this.curvatura,
    required this.sensibilidades,
    required this.observaciones,
  });

  final String clientaId;
  final String estadoPestanas;
  final String formaOjos;
  final String tecnica;
  final String diseno;
  final String longitudes;
  final String grosor;
  final String curvatura;
  final String sensibilidades;
  final String observaciones;
}

class TrazoMapping {
  TrazoMapping(this.puntos, this.color, this.grosor);

  final List<Offset> puntos;
  final Color color;
  final double grosor;
}

class Pago {
  Pago({required this.citaId, required this.valor, required this.fecha})
    : id = DateTime.now().microsecondsSinceEpoch.toString();

  final String id;
  final String citaId;
  final int valor;
  final DateTime fecha;
}

class Cita {
  Cita({
    required this.clientaId,
    required this.servicioId,
    required this.fecha,
    required this.hora,
    required this.precio,
    this.anticipo = 0,
    this.estado = 'Confirmada',
  }) : id = DateTime.now().microsecondsSinceEpoch.toString();

  final String id;
  final String clientaId;
  final String servicioId;
  final DateTime fecha;
  final String hora;
  final int precio;
  int anticipo;
  String estado;

  int get saldo => precio - anticipo;
}

class Gasto {
  Gasto({required this.descripcion, required this.valor, required this.fecha})
    : id = DateTime.now().microsecondsSinceEpoch.toString();

  final String id;
  final String descripcion;
  final int valor;
  final DateTime fecha;
}

class EstadoAplicacion extends ChangeNotifier {
  final List<Clienta> clientas = [];
  final List<Servicio> servicios = [
    Servicio(nombre: 'Retoque clásico', precio: 80000, duracion: 90),
    Servicio(nombre: 'Volumen tecnológico', precio: 120000, duracion: 150),
    Servicio(nombre: 'Retiro de extensiones', precio: 30000, duracion: 45),
  ];
  final List<Cita> citas = [];
  final List<Pago> pagos = [];
  final List<Gasto> gastos = [];
  final Map<String, FichaTecnica> fichasTecnicas = {};
  final Map<String, List<TrazoMapping>> mappings = {};

  void agregarClienta({
    required String nombre,
    required String telefono,
    String notas = '',
  }) {
    clientas.add(Clienta(nombre: nombre, telefono: telefono, notas: notas));
    notifyListeners();
  }

  void agregarCita({
    required String clientaId,
    required String servicioId,
    required DateTime fecha,
    required String hora,
    required int anticipo,
  }) {
    final servicio = servicios.firstWhere((item) => item.id == servicioId);
    citas.add(
      Cita(
        clientaId: clientaId,
        servicioId: servicioId,
        fecha: fecha,
        hora: hora,
        precio: servicio.precio,
        anticipo: anticipo,
      ),
    );
    notifyListeners();
  }

  void actualizarServicio({
    required String id,
    required String nombre,
    required int precio,
    required int duracion,
  }) {
    final indice = servicios.indexWhere((servicio) => servicio.id == id);
    if (indice < 0) return;
    servicios[indice] = Servicio(
      nombre: nombre,
      precio: precio,
      duracion: duracion,
    )..activo = servicios[indice].activo;
    notifyListeners();
  }

  void agregarServicio({
    required String nombre,
    required int precio,
    required int duracion,
  }) {
    servicios.add(Servicio(nombre: nombre, precio: precio, duracion: duracion));
    notifyListeners();
  }

  void cambiarEstadoServicio(String id) {
    final servicio = buscarServicio(id);
    if (servicio == null) return;
    servicio.activo = !servicio.activo;
    notifyListeners();
  }

  bool agregarPago({required String citaId, required int valor}) {
    final cita = citas.firstWhere((item) => item.id == citaId);
    if (valor <= 0 || valor > cita.saldo) return false;
    pagos.add(Pago(citaId: citaId, valor: valor, fecha: DateTime.now()));
    cita.anticipo += valor;
    notifyListeners();
    return true;
  }

  void cambiarEstadoCita(String id, String estadoNuevo) {
    final cita = citas.firstWhere((item) => item.id == id);
    cita.estado = estadoNuevo;
    notifyListeners();
  }

  void guardarFichaTecnica(FichaTecnica ficha) {
    fichasTecnicas[ficha.clientaId] = ficha;
    notifyListeners();
  }

  void guardarMapping(String clientaId, List<TrazoMapping> trazos) {
    mappings[clientaId] = List<TrazoMapping>.from(trazos);
    notifyListeners();
  }

  void agregarGasto({required String descripcion, required int valor}) {
    gastos.add(
      Gasto(descripcion: descripcion, valor: valor, fecha: DateTime.now()),
    );
    notifyListeners();
  }

  Clienta? buscarClienta(String id) {
    for (final clienta in clientas) {
      if (clienta.id == id) return clienta;
    }
    return null;
  }

  Servicio? buscarServicio(String id) {
    for (final servicio in servicios) {
      if (servicio.id == id) return servicio;
    }
    return null;
  }

  int get ingresos => citas.fold(0, (total, cita) => total + cita.anticipo);
  int get pendientes => citas.fold(0, (total, cita) => total + cita.saldo);
  int get totalGastos => gastos.fold(0, (total, gasto) => total + gasto.valor);
}

class ProveedorEstado extends InheritedNotifier<EstadoAplicacion> {
  const ProveedorEstado({
    required super.notifier,
    required super.child,
    super.key,
  });

  static EstadoAplicacion leer(BuildContext context, {bool escuchar = true}) {
    final proveedor = escuchar
        ? context.dependOnInheritedWidgetOfExactType<ProveedorEstado>()
        : context
                  .getElementForInheritedWidgetOfExactType<ProveedorEstado>()
                  ?.widget
              as ProveedorEstado?;
    assert(
      proveedor != null,
      'ProveedorEstado no encontrado en el árbol de widgets.',
    );
    return proveedor!.notifier!;
  }
}

String formatoPesos(int valor) {
  final texto = valor.toString();
  final partes = <String>[];
  for (var indice = texto.length; indice > 0; indice -= 3) {
    final inicio = indice - 3 < 0 ? 0 : indice - 3;
    partes.insert(0, texto.substring(inicio, indice));
  }
  return '\$ ${partes.join('.')}';
}
