import 'package:flutter/material.dart';

const colorRosaPrincipal = Color(0xFFB85C78);
const colorRosaSuave = Color(0xFFF8E8EC);
const colorCrema = Color(0xFFFFFBF8);
const colorTinta = Color(0xFF30292B);
const colorVerde = Color(0xFF397461);

ThemeData crearTemaAplicacion() {
  final esquema =
      ColorScheme.fromSeed(
        seedColor: colorRosaPrincipal,
        brightness: Brightness.light,
      ).copyWith(
        primary: colorRosaPrincipal,
        secondary: colorVerde,
        surface: Colors.white,
        onSurface: colorTinta,
      );

  return ThemeData(
    colorScheme: esquema,
    scaffoldBackgroundColor: colorCrema,
    useMaterial3: true,
    appBarTheme: const AppBarTheme(
      backgroundColor: colorCrema,
      foregroundColor: colorTinta,
      elevation: 0,
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: Colors.white,
      indicatorColor: colorRosaSuave,
      labelTextStyle: WidgetStateProperty.all(
        const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
      ),
    ),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    ),
  );
}
