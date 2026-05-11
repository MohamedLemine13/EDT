import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/seance.dart';
import '../theme/app_theme.dart';

/// Reusable seance card widget — updated for SeanceDto from backend.
class SeanceCard extends StatelessWidget {
  final SeanceDto seance;
  final VoidCallback? onTap;

  const SeanceCard({super.key, required this.seance, this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = _getSeanceColor(isDark);
    final textColor = _getSeanceTextColor(isDark);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: textColor.withAlpha(40),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: color.withAlpha(60),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top row: matiere code + type badge + salle
            Row(
              children: [
                Text(
                  seance.matiereCode,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: textColor,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: textColor.withAlpha(30),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    seance.type,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: textColor,
                    ),
                  ),
                ),
                const Spacer(),
                // Status badge
                if (seance.statut == 'ANNULEE')
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.error.withAlpha(30),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'Annulé',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.error,
                      ),
                    ),
                  )
                else if (seance.salleNoms.isNotEmpty)
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.room_outlined,
                        size: 14,
                        color: textColor.withAlpha(178),
                      ),
                      const SizedBox(width: 2),
                      Text(
                        seance.salleDisplay,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: textColor.withAlpha(200),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
            const SizedBox(height: 6),

            // Subject name
            Text(
              seance.matiereIntitule,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: textColor.withAlpha(230),
              ),
            ),

            // Tag / Note
            if (seance.tag != null && seance.tag!.isNotEmpty) ...[
              const SizedBox(height: 2),
              Text(
                seance.tag!,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontStyle: FontStyle.italic,
                  color: textColor.withAlpha(160),
                ),
              ),
            ],

            // Professor
            if (seance.professeurNoms.isNotEmpty) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(
                    Icons.person_outline_rounded,
                    size: 14,
                    color: textColor.withAlpha(140),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      seance.professeurDisplay,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: textColor.withAlpha(160),
                        fontWeight: FontWeight.w400,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _getSeanceColor(bool isDark) {
    switch (seance.type) {
      case 'CM':
        return isDark ? const Color(0xFF1A2E4A) : const Color(0xFFBBDEFB);
      case 'TD':
        return isDark ? const Color(0xFF1B3B1E) : const Color(0xFFC8E6C9);
      case 'TP':
        return isDark ? const Color(0xFF3B2A10) : const Color(0xFFFFE0B2);
      default:
        return isDark ? const Color(0xFF2C2C2C) : const Color(0xFFF5F5F5);
    }
  }

  Color _getSeanceTextColor(bool isDark) {
    switch (seance.type) {
      case 'CM':
        return isDark ? const Color(0xFF90CAF9) : const Color(0xFF1565C0);
      case 'TD':
        return isDark ? const Color(0xFFA5D6A7) : const Color(0xFF2E7D32);
      case 'TP':
        return isDark ? const Color(0xFFFFCC80) : const Color(0xFFE65100);
      default:
        return isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    }
  }
}
