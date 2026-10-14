import 'package:flutter_test/flutter_test.dart';

import 'package:mi_belleza/aplicacion/aplicacion.dart';

void main() {
  testWidgets('muestra el resumen inicial del negocio', (tester) async {
    await tester.pumpWidget(const AplicacionMiBelleza());

    expect(find.text('Buenos días, Laura'), findsOneWidget);
    expect(find.text('Próximas citas'), findsOneWidget);
  });

  testWidgets('permite navegar entre las secciones principales', (
    tester,
  ) async {
    await tester.pumpWidget(const AplicacionMiBelleza());

    await tester.tap(find.text('Clientas'));
    await tester.pumpAndSettle();

    expect(find.text('Aún no tienes clientas'), findsOneWidget);
  });

  testWidgets('abre el formulario para registrar una clienta', (tester) async {
    await tester.pumpWidget(const AplicacionMiBelleza());
    await tester.tap(find.text('Clientas'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Nueva clienta'));
    await tester.pumpAndSettle();

    expect(find.text('Nueva clienta'), findsNWidgets(2));
    expect(find.text('Nombre completo'), findsOneWidget);
  });
}
