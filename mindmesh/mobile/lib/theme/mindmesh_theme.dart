// ============================================================================
// MindMesh Mobile - Production Design Tokens & Theme
// Strict alignment with Operations Console (Editorial, Utilitarian, Anti-AI)
// ============================================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class MindMeshColors {
  // Brand
  static const Color brand = Color(0xFF1F5D46); // Deep forest green
  static const Color brandHover = Color(0xFF184A38);
  static const Color brandTint = Color(0xFFE7F1EC);

  // Neutrals (Warm Greys)
  static const Color ink = Color(0xFF17201C);
  static const Color textSecondary = Color(0xFF55605A);
  static const Color textTertiary = Color(0xFF7C867F);
  static const Color border = Color(0xFFE3E7E4);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color canvas = Color(0xFFF6F7F5);
  static const Color subtleFill = Color(0xFFEEF1EE);

  // Semantic
  static const Color critical = Color(0xFFB42318);
  static const Color criticalBg = Color(0xFFFDECEA);
  static const Color warning = Color(0xFFA15C07);
  static const Color warningBg = Color(0xFFFEF3E2);
  static const Color success = Color(0xFF1F7A4D);
  static const Color successBg = Color(0xFFE6F4EC);
  static const Color info = Color(0xFF1D5FA8);
  static const Color infoBg = Color(0xFFE8F0FA);
  static const Color neutralChip = Color(0xFF66706B);
  static const Color neutralChipBg = Color(0xFFF0F2F0);
}

class MindMeshTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: MindMeshColors.canvas,
      colorScheme: const ColorScheme.light(
        primary: MindMeshColors.brand,
        onPrimary: Colors.white,
        surface: MindMeshColors.surface,
        onSurface: MindMeshColors.ink,
        outline: MindMeshColors.border,
      ),
      fontFamily: GoogleFonts.inter().fontFamily,
      textTheme: GoogleFonts.interTextTheme(),
      appBarTheme: const AppBarTheme(
        backgroundColor: MindMeshColors.surface,
        foregroundColor: MindMeshColors.ink,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: MindMeshColors.ink,
          fontSize: 16,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.2,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: MindMeshColors.surface,
        selectedItemColor: MindMeshColors.brand,
        unselectedItemColor: MindMeshColors.textTertiary,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        unselectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
      ),
      cardTheme: CardThemeData(
        color: MindMeshColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: const BorderSide(color: MindMeshColors.border, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: MindMeshColors.brand,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(44),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(6),
          ),
          textStyle: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.1,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: MindMeshColors.ink,
          minimumSize: const Size.fromHeight(44),
          side: const BorderSide(color: MindMeshColors.border, width: 1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(6),
          ),
          textStyle: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: MindMeshColors.border, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: MindMeshColors.border, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: MindMeshColors.brand, width: 2),
        ),
        hintStyle: const TextStyle(color: MindMeshColors.textTertiary, fontSize: 13),
        labelStyle: const TextStyle(color: MindMeshColors.textSecondary, fontSize: 13),
      ),
    );
  }
}
