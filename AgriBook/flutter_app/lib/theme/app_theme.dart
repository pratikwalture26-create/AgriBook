import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryGreen = Color(0xFF065F46); // Emerald 800
  static const Color lightGreen = Color(0xFFECFDF5);   // Emerald 50
  static const Color accentAmber = Color(0xFFD97706);  // Amber 600
  static const Color surfaceWhite = Colors.white;
  static const Color backgroundSlate = Color(0xFFF8FAFC); // Slate 50
  static const Color textDark = Color(0xFF0F172A);      // Slate 900
  static const Color textMuted = Color(0xFF64748B);     // Slate 500

  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: backgroundSlate,
      primaryColor: primaryGreen,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryGreen,
        primary: primaryGreen,
        secondary: accentAmber,
        surface: surfaceWhite,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardTheme(
        color: surfaceWhite,
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        ),
      ),
    );
  }
}
