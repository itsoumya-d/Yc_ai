import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryGreen = Color(0xFF059669);
  static const Color primaryGreenLight = Color(0xFF34D399);
  static const Color primaryGreenDark = Color(0xFF047857);
  static const Color surfaceColor = Color(0xFFF0FDF4);
  static const Color onSurface = Color(0xFF064E3B);
  static const Color warningAmber = Color(0xFFF59E0B);
  static const Color errorRed = Color(0xFFEF4444);
  static const Color successGreen = Color(0xFF10B981);

  static ThemeData get lightTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryGreen,
      brightness: Brightness.light,
      primary: primaryGreen,
      onPrimary: Colors.white,
      primaryContainer: const Color(0xFFD1FAE5),
      onPrimaryContainer: primaryGreenDark,
      secondary: const Color(0xFF0EA5E9),
      surface: Colors.white,
      onSurface: const Color(0xFF1F2937),
      error: errorRed,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      fontFamily: 'Roboto',
      appBarTheme: AppBarTheme(
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: const TextStyle(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        color: Colors.white,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 2,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.white,
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
          borderSide: const BorderSide(color: primaryGreen, width: 2),
        ),
        filled: true,
        fillColor: const Color(0xFFF9FAFB),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: const Color(0xFFD1FAE5),
        labelStyle: const TextStyle(color: primaryGreenDark, fontWeight: FontWeight.w500),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        side: BorderSide.none,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        selectedItemColor: primaryGreen,
        unselectedItemColor: Color(0xFF9CA3AF),
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        elevation: 8,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        elevation: 4,
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0xFFE5E7EB),
        thickness: 1,
      ),
      scaffoldBackgroundColor: const Color(0xFFF9FAFB),
    );
  }

  static ThemeData get darkTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryGreen,
      brightness: Brightness.dark,
      primary: primaryGreenLight,
      onPrimary: const Color(0xFF064E3B),
      primaryContainer: primaryGreenDark,
      onPrimaryContainer: const Color(0xFFD1FAE5),
      surface: const Color(0xFF1F2937),
      onSurface: const Color(0xFFF9FAFB),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      fontFamily: 'Roboto',
      scaffoldBackgroundColor: const Color(0xFF111827),
      appBarTheme: AppBarTheme(
        backgroundColor: const Color(0xFF1F2937),
        foregroundColor: primaryGreenLight,
        elevation: 0,
        titleTextStyle: TextStyle(
          color: primaryGreenLight,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        color: const Color(0xFF1F2937),
      ),
    );
  }
}
