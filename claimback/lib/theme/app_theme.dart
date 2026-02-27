import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryOrange = Color(0xFFEA580C);
  static const Color amber = Color(0xFFF59E0B);
  static const Color lightOrange = Color(0xFFFFF7ED);
  static const Color darkOrange = Color(0xFFC2410C);
  static const Color successGreen = Color(0xFF16A34A);
  static const Color errorRed = Color(0xFFDC2626);
  static const Color warningYellow = Color(0xFFF59E0B);

  static ThemeData get lightTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryOrange,
      brightness: Brightness.light,
      primary: primaryOrange,
      onPrimary: Colors.white,
      primaryContainer: lightOrange,
      onPrimaryContainer: darkOrange,
      secondary: amber,
      onSecondary: Colors.white,
      surface: Colors.white,
      onSurface: const Color(0xFF1C1917),
      surfaceContainerHighest: const Color(0xFFF8FAFC),
      error: errorRed,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryOrange,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryOrange,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 50),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          elevation: 0,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryOrange,
          side: const BorderSide(color: primaryOrange),
          minimumSize: const Size(double.infinity, 50),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: primaryOrange, width: 2),
        ),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        color: Colors.white,
      ),
    );
  }
}
