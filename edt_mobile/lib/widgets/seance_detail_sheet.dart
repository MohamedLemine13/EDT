import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/seance.dart';
import '../theme/app_theme.dart';

/// Shows full seance details in a modal bottom sheet — updated for SeanceDto.
class SeanceDetailSheet extends StatelessWidget {
  final SeanceDto seance;

  const SeanceDetailSheet({super.key, required this.seance});

  /// Show this sheet from any context
  static void show(BuildContext context, SeanceDto seance) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SeanceDetailSheet(seance: seance),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(top: 12),
            decoration: BoxDecoration(
              color: (isDark ? AppColors.darkBorder : AppColors.border),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header row: code + type badge
                Row(
                  children: [
                    _typeBadge(isDark),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        seance.matiereCode,
                        style: GoogleFonts.inter(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Subject name
                Text(
                  seance.matiereIntitule,
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),

                // Tag
                if (seance.tag != null && seance.tag!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    seance.tag!,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontStyle: FontStyle.italic,
                      color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                    ),
                  ),
                ],

                const SizedBox(height: 20),

                // Detail rows
                _detailRow(
                  Icons.calendar_today_rounded,
                  'Jour',
                  _dayLabel(seance.jour),
                  isDark,
                ),
                _detailRow(
                  Icons.schedule_rounded,
                  'Créneau',
                  seance.creneauLabel,
                  isDark,
                ),
                if (seance.professeurNoms.isNotEmpty)
                  _detailRow(
                    Icons.person_outline_rounded,
                    'Professeur',
                    seance.professeurDisplay,
                    isDark,
                  ),
                if (seance.salleNoms.isNotEmpty)
                  _detailRow(
                    Icons.room_outlined,
                    'Salle',
                    seance.salleDisplay,
                    isDark,
                  )
                else
                  _detailRow(
                    Icons.language_rounded,
                    'Lieu',
                    'En ligne',
                    isDark,
                    valueColor: AppColors.enLigne,
                  ),
                _detailRow(
                  Icons.school_rounded,
                  'Type',
                  _typeFullName(seance.type),
                  isDark,
                ),
                _detailRow(
                  Icons.info_outline_rounded,
                  'Statut',
                  _statutLabel(seance.statut),
                  isDark,
                ),

                const SizedBox(height: 12),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _typeBadge(bool isDark) {
    final color = _getTypeColor();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        seance.type,
        style: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w800,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _detailRow(
    IconData icon,
    String label,
    String value,
    bool isDark, {
    Color? valueColor,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: (isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              size: 18,
              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                ),
              ),
              Text(
                value,
                style: GoogleFonts.inter(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: valueColor ??
                      (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getTypeColor() {
    switch (seance.type) {
      case 'CM':
        return const Color(0xFF1565C0);
      case 'TD':
        return const Color(0xFF2E7D32);
      case 'TP':
        return const Color(0xFFE65100);
      default:
        return AppColors.primaryLight;
    }
  }

  String _typeFullName(String type) {
    switch (type) {
      case 'CM':
        return 'Cours Magistral';
      case 'TD':
        return 'Travaux Dirigés';
      case 'TP':
        return 'Travaux Pratiques';
      case 'DEVOIR':
        return 'Devoir';
      case 'EXAMEN':
        return 'Examen';
      default:
        return type;
    }
  }

  String _statutLabel(String statut) {
    switch (statut) {
      case 'PLANIFIEE':
        return 'Planifié';
      case 'REALISEE':
        return 'Terminé';
      case 'ANNULEE':
        return 'Annulé';
      default:
        return statut;
    }
  }

  String _dayLabel(String day) {
    const labels = {
      'LUNDI': 'Lundi',
      'MARDI': 'Mardi',
      'MERCREDI': 'Mercredi',
      'JEUDI': 'Jeudi',
      'VENDREDI': 'Vendredi',
      'SAMEDI': 'Samedi',
    };
    return labels[day] ?? day;
  }
}
