import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryNavy = Color(0xFF0D2B6B);
  static const Color primaryBlue = Color(0xFF1A56DB);
  static const Color accentBlue = Color(0xFF3B82F6);
  static const Color lightBlue = Color(0xFFEFF6FF);
  static const Color successGreen = Color(0xFF16A34A);
  static const Color warningAmber = Color(0xFFD97706);
  static const Color errorRed = Color(0xFFDC2626);

  static ThemeData get lightTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryBlue,
      brightness: Brightness.light,
      primary: primaryBlue,
      onPrimary: Colors.white,
      primaryContainer: lightBlue,
      onPrimaryContainer: primaryNavy,
      secondary: primaryNavy,
      onSecondary: Colors.white,
      surface: Colors.white,
      onSurface: const Color(0xFF1E293B),
      surfaceContainerHighest: const Color(0xFFF1F5F9),
      error: errorRed,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      fontFamily: 'Roboto',
      appBarTheme: AppBarTheme(
        backgroundColor: primaryNavy,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: const TextStyle(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryBlue,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          elevation: 0,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryBlue,
          side: const BorderSide(color: primaryBlue),
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: primaryBlue, width: 2),
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
      chipTheme: ChipThemeData(
        selectedColor: primaryBlue,
        labelStyle: const TextStyle(fontSize: 13),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        selectedItemColor: primaryBlue,
        unselectedItemColor: Color(0xFF94A3B8),
        backgroundColor: Colors.white,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
