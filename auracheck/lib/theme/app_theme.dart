import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryRose = Color(0xFFE11D48);
  static const Color primaryPeach = Color(0xFFFB923C);
  static const Color primaryCoral = Color(0xFFF43F5E);
  static const Color lightPink = Color(0xFFFDA4AF);
  static const Color softPeach = Color(0xFFFECDD3);
  static const Color warmCream = Color(0xFFFFF1F2);
  static const Color riskLow = Color(0xFF22C55E);
  static const Color riskModerate = Color(0xFFF59E0B);
  static const Color riskHigh = Color(0xFFF97316);
  static const Color riskUrgent = Color(0xFFEF4444);

  static ThemeData get lightTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryCoral,
      brightness: Brightness.light,
      primary: primaryCoral,
      onPrimary: Colors.white,
      primaryContainer: softPeach,
      onPrimaryContainer: primaryRose,
      secondary: primaryPeach,
      onSecondary: Colors.white,
      surface: Colors.white,
      onSurface: const Color(0xFF1F1517),
      error: const Color(0xFFEF4444),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      fontFamily: 'Roboto',
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: primaryRose,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: primaryRose,
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
        iconTheme: IconThemeData(color: primaryRose),
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        color: Colors.white,
        surfaceTintColor: Colors.transparent,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryCoral,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          elevation: 2,
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: primaryCoral,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: primaryCoral, width: 2),
        ),
        filled: true,
        fillColor: const Color(0xFFFFF1F2),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: softPeach,
        labelStyle: TextStyle(color: primaryRose, fontWeight: FontWeight.w500),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        side: BorderSide.none,
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: primaryCoral,
        foregroundColor: Colors.white,
        elevation: 4,
      ),
      dividerTheme: const DividerThemeData(color: Color(0xFFFFE4E6), thickness: 1),
      scaffoldBackgroundColor: const Color(0xFFFFF1F2),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        selectedItemColor: primaryCoral,
        unselectedItemColor: Colors.grey.shade400,
        backgroundColor: Colors.white,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }

  static ThemeData get darkTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryCoral,
      brightness: Brightness.dark,
      primary: lightPink,
      onPrimary: const Color(0xFF1F1517),
      surface: const Color(0xFF2D1B1E),
      onSurface: const Color(0xFFFFF1F2),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      fontFamily: 'Roboto',
      scaffoldBackgroundColor: const Color(0xFF1A0F11),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF2D1B1E),
        foregroundColor: Color(0xFFFDA4AF),
        elevation: 0,
        titleTextStyle: TextStyle(color: Color(0xFFFDA4AF), fontSize: 20, fontWeight: FontWeight.w700),
      ),
      cardTheme: CardTheme(
        color: const Color(0xFF2D1B1E),
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }
}
