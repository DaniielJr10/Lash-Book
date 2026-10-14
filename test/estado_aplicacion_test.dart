import 'package:flutter_test/flutter_test.dart';

import 'package:mi_belleza/nucleo/estado/estado_aplicacion.dart';

void main() {
  test('calcula saldo y registra pagos parciales sin excederlo', () {
    final estado = EstadoAplicacion();
    estado.agregarClienta(nombre: 'Ana Pérez', telefono: '3001234567');
    final clienta = estado.clientas.single;
    final servicio = estado.servicios.first;
    estado.agregarCita(
      clientaId: clienta.id,
      servicioId: servicio.id,
      fecha: DateTime(2026, 10, 14),
      hora: '10:00',
      anticipo: 20000,
    );
    final cita = estado.citas.single;

    expect(cita.saldo, 60000);
    expect(estado.agregarPago(citaId: cita.id, valor: 30000), isTrue);
    expect(cita.saldo, 30000);
    expect(estado.agregarPago(citaId: cita.id, valor: 30001), isFalse);
    expect(cita.saldo, 30000);
    expect(estado.ingresos, 50000);
  });

  test('administra servicios activos y gastos', () {
    final estado = EstadoAplicacion();
    final servicio = estado.servicios.first;

    estado.cambiarEstadoServicio(servicio.id);
    estado.agregarServicio(nombre: 'Laminado', precio: 50000, duracion: 60);
    estado.agregarGasto(descripcion: 'Adhesivo', valor: 25000);

    expect(servicio.activo, isFalse);
    expect(estado.servicios, hasLength(4));
    expect(estado.totalGastos, 25000);
  });
}
