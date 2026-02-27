import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryAmber = Color(0xFFF59E0B);
  static const Color primaryAmberDark = Color(0xFFD97706);
  static const Color primaryAmberLight = Color(0xFFFCD34D);
  static const Color safetyYellow = Color(0xFFFBBF24);
  static const Color constructionOrange = Color(0xFFF97316);
  static const Color darkSurface = Color(0xFF1C1917);
  static const Color safetyRed = Color(0xFFEF4444);
  static const Color safetyGreen = Color(0xFF22C55E);

  static ThemeData get lightTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryAmber,
      brightness: Brightness.light,
      primary: primaryAmber,
      onPrimary: const Color(0xFF1C1917),
      primaryContainer: const Color(0xFFFEF3C7),
      onPrimaryContainer: primaryAmberDark,
      secondary: constructionOrange,
      onSecondary: Colors.white,
      surface: Colors.white,
      onSurface: const Color(0xFF1C1917),
      error: safetyRed,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1C1917),
        foregroundColor: Color(0xFFFBBF24),
        elevation: 0,
        titleTextStyle: TextStyle(
          color: Color(0xFFFBBF24),
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
        iconTheme: IconThemeData(color: Color(0xFFFBBF24)),
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        color: Colors.white,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryAmber,
          foregroundColor: const Color(0xFF1C1917),
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 2,
          textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: primaryAmber,
          foregroundColor: const Color(0xFF1C1917),
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryAmber, width: 2),
        ),
        filled: true,
        fillColor: const Color(0xFFF9FAFB),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: const Color(0xFFFEF3C7),
        labelStyle: const TextStyle(color: primaryAmberDark, fontWeight: FontWeight.w500),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        side: BorderSide.none,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryAmber,
        foregroundColor: Color(0xFF1C1917),
        elevation: 4,
      ),
      scaffoldBackgroundColor: const Color(0xFFF9FAFB),
    );
  }

  static ThemeData get darkTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryAmber,
      brightness: Brightness.dark,
      primary: safetyYellow,
      onPrimary: const Color(0xFF1C1917),
      surface: const Color(0xFF292524),
      onSurface: const Color(0xFFFAFAF9),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      fontFamily: 'Roboto',
      scaffoldBackgroundColor: const Color(0xFF1C1917),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF292524),
        foregroundColor: Color(0xFFFBBF24),
        elevation: 0,
        titleTextStyle: TextStyle(color: Color(0xFFFBBF24), fontSize: 20, fontWeight: FontWeight.w700),
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        color: const Color(0xFF292524),
      ),
    );
  }
}
