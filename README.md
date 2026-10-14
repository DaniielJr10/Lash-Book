# Mi Belleza

Aplicación Flutter para gestionar clientas, fichas técnicas, mappings, agenda y
finanzas de un estudio de extensiones de pestañas.

## Estado actual

La aplicación tiene una primera versión navegable y funcional sin conexión a
base de datos. Los registros de esta versión viven en memoria y se reinician al
cerrar la aplicación; esto permite validar la experiencia y los flujos antes de
incorporar persistencia.

Ya disponible:

- Inicio con indicadores dinámicos de citas, anticipos y saldos.
- Registro, búsqueda y consulta de clientas.
- Agenda con clienta, servicio, fecha, hora y validación de anticipos.
- Detalle de citas con estados y pagos parciales sin sobrepasar el saldo.
- Finanzas con ingresos recibidos, saldos pendientes y gastos.
- Administración de servicios, precios, duración y estado activo.
- Ficha técnica por clienta con sensibilidades y observaciones.
- Mapping táctil con trazos, deshacer, limpiar y guardado temporal.
- Tema Material 3 y navegación en español.

Pendiente para la siguiente etapa:

- Persistencia local SQLite y migraciones.
- Autenticación, Supabase, RLS y sincronización sin conexión.

## Comandos

```text
flutter pub get
dart format .
flutter analyze
flutter test
flutter run
```

El proyecto requiere Flutter 3.35.1 o posterior compatible con Dart 3.9.