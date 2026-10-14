import 'package:flutter/material.dart';

import '../funcionalidades/agenda/presentacion/pantalla_agenda.dart';
import '../funcionalidades/clientas/presentacion/pantalla_clientas.dart';
import '../funcionalidades/finanzas/presentacion/pantalla_finanzas.dart';
import '../funcionalidades/inicio/presentacion/pantalla_inicio.dart';
import '../funcionalidades/servicios/presentacion/pantalla_servicios.dart';
import '../nucleo/estado/estado_aplicacion.dart';
import 'tema/tema_aplicacion.dart';

class AplicacionMiBelleza extends StatelessWidget {
  const AplicacionMiBelleza({super.key});

  @override
  Widget build(BuildContext context) {
    return ProveedorEstado(
      notifier: EstadoAplicacion(),
      child: MaterialApp(
        title: 'Mi Belleza',
        debugShowCheckedModeBanner: false,
        theme: crearTemaAplicacion(),
        home: const PantallaPrincipal(),
      ),
    );
  }
}

class PantallaPrincipal extends StatefulWidget {
  const PantallaPrincipal({super.key});

  @override
  State<PantallaPrincipal> createState() => _EstadoPantallaPrincipal();
}

class _EstadoPantallaPrincipal extends State<PantallaPrincipal> {
  int indiceSeleccionado = 0;

  static const pantallas = <Widget>[
    PantallaInicio(),
    PantallaAgenda(),
    PantallaClientas(),
    PantallaFinanzas(),
    PantallaServicios(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: indiceSeleccionado, children: pantallas),
      bottomNavigationBar: NavigationBar(
        selectedIndex: indiceSeleccionado,
        onDestinationSelected: (nuevoIndice) {
          setState(() => indiceSeleccionado = nuevoIndice);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.space_dashboard_outlined),
            selectedIcon: Icon(Icons.space_dashboard),
            label: 'Inicio',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            selectedIcon: Icon(Icons.calendar_month),
            label: 'Agenda',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline),
            selectedIcon: Icon(Icons.people),
            label: 'Clientas',
          ),
          NavigationDestination(
            icon: Icon(Icons.payments_outlined),
            selectedIcon: Icon(Icons.payments),
            label: 'Finanzas',
          ),
          NavigationDestination(
            icon: Icon(Icons.design_services_outlined),
            selectedIcon: Icon(Icons.design_services),
            label: 'Servicios',
          ),
        ],
      ),
    );
  }
}
