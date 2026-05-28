import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Primary palette
  static const Color primary = Color(0xFF1B5E20);       // Dark green
  static const Color primaryLight = Color(0xFF4CAF50);   // Green
  static const Color primaryDark = Color(0xFF0D3B11);    // Deeper green
  static const Color accent = Color(0xFF00BFA5);         // Teal accent

  // Surface / background – Light
  static const Color background = Color(0xFFF5F7FA);
  static const Color surface = Colors.white;
  static const Color surfaceVariant = Color(0xFFEEF2F6);
  static const Color card = Colors.white;

  // Surface / background – Dark
  static const Color darkBackground = Color(0xFF121212);
  static const Color darkSurface = Color(0xFF1E1E1E);
  static const Color darkSurfaceVariant = Color(0xFF2C2C2C);
  static const Color darkCard = Color(0xFF252525);

  // Text – Light
  static const Color textPrimary = Color(0xFF1A1A2E);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textOnPrimary = Colors.white;

  // Text – Dark
  static const Color darkTextPrimary = Color(0xFFE0E0E0);
  static const Color darkTextSecondary = Color(0xFF9E9E9E);

  // Seance type colors
  static const Color cm = Color(0xFF90CAF9);         // Light blue
  static const Color td = Color(0xFFA5D6A7);         // Light green
  static const Color tp = Color(0xFFFFCC80);          // Light orange
  static const Color enLigne = Color(0xFF81C784);     // Green
  static const Color instructionMil = Color(0xFFEF5350); // Red

  // Seance type colors – Dark variants
  static const Color cmDark = Color(0xFF1565C0);
  static const Color tdDark = Color(0xFF2E7D32);
  static const Color tpDark = Color(0xFFE65100);
  static const Color enLigneDark = Color(0xFF388E3C);
  static const Color instructionMilDark = Color(0xFFC62828);

  // Day header colors
  static const Color dayHeader = Color(0xFF2E7D32);

  // Time slot header
  static const Color timeSlotHeader = Color(0xFF1B5E20);

  // Borders
  static const Color border = Color(0xFFE0E0E0);
  static const Color divider = Color(0xFFEEEEEE);
  static const Color darkBorder = Color(0xFF3A3A3A);
  static const Color darkDivider = Color(0xFF333333);

  // Status
  static const Color error = Color(0xFFD32F2F);
  static const Color success = Color(0xFF388E3C);

  // Today highlight
  static const Color todayHighlight = Color(0xFFFFF9C4); // Soft yellow
  static const Color darkTodayHighlight = Color(0xFF33302A); // Dark yellow-ish
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.light,
        primary: AppColors.primary,
        onPrimary: AppColors.textOnPrimary,
        surface: AppColors.surface,
        onSurface: AppColors.textPrimary,
        error: AppColors.error,
      ),
      scaffoldBackgroundColor: AppColors.background,
      textTheme: GoogleFonts.interTextTheme(),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.textOnPrimary,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.textOnPrimary,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
          elevation: 2,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceVariant,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.error, width: 1),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        hintStyle: GoogleFonts.inter(
          color: AppColors.textSecondary,
          fontSize: 14,
        ),
        labelStyle: GoogleFonts.inter(
          color: AppColors.textSecondary,
          fontSize: 14,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.card,
        elevation: 2,
        shadowColor: Colors.black.withAlpha(25),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primaryLight,
        brightness: Brightness.dark,
        primary: AppColors.primaryLight,
        onPrimary: Colors.white,
        surface: AppColors.darkSurface,
        onSurface: AppColors.darkTextPrimary,
        error: AppColors.error,
      ),
      scaffoldBackgroundColor: AppColors.darkBackground,
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.darkSurface,
        foregroundColor: AppColors.darkTextPrimary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.darkTextPrimary,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryLight,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
          elevation: 2,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkSurfaceVariant,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primaryLight, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.error, width: 1),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        hintStyle: GoogleFonts.inter(
          color: AppColors.darkTextSecondary,
          fontSize: 14,
        ),
        labelStyle: GoogleFonts.inter(
          color: AppColors.darkTextSecondary,
          fontSize: 14,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.darkCard,
        elevation: 2,
        shadowColor: Colors.black.withAlpha(60),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}
