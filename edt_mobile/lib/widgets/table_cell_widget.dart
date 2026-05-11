import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/seance.dart';
import '../theme/app_theme.dart';

/// Compact cell for the table/grid view — updated for SeanceDto.
class TableCellWidget extends StatelessWidget {
  final SeanceDto? seance;
  final VoidCallback? onTap;
  final bool isHighlighted;
  final bool isHoliday;
  final String? holidayTitle;

  const TableCellWidget({
    super.key,
    this.seance,
    this.onTap,
    this.isHighlighted = false,
    this.isHoliday = false,
    this.holidayTitle,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Holiday cell
    if (isHoliday) {
      return Container(
        width: 120,
        height: 72,
        margin: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF2A2A2A) : const Color(0xFFE0E0E0),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isDark ? AppColors.darkBorder : AppColors.border,
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          holidayTitle ?? 'Férié',
          style: GoogleFonts.inter(
            fontSize: 9,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
          ),
          textAlign: TextAlign.center,
        ),
      );
    }

    if (seance == null) {
      return GestureDetector(
        onTap: onTap,
        child: Container(
          width: 120,
          height: 72,
          margin: const EdgeInsets.all(2),
          decoration: BoxDecoration(
            color: isHighlighted
                ? (isDark ? AppColors.darkTodayHighlight : AppColors.todayHighlight)
                : (isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant).withAlpha(128),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: (isDark ? AppColors.darkBorder : AppColors.border).withAlpha(80),
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            '—',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary).withAlpha(100),
            ),
          ),
        ),
      );
    }

    final color = _getColor(isDark);
    final textColor = _getTextColor(isDark);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 120,
        height: 72,
        margin: const EdgeInsets.all(2),
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: textColor.withAlpha(40)),
          boxShadow: isHighlighted
              ? [BoxShadow(color: AppColors.primaryLight.withAlpha(80), blurRadius: 6)]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    seance!.matiereCode,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: textColor,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                  decoration: BoxDecoration(
                    color: textColor.withAlpha(30),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    seance!.type,
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: textColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              seance!.matiereIntitule,
              style: GoogleFonts.inter(
                fontSize: 9,
                fontWeight: FontWeight.w500,
                color: textColor.withAlpha(200),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            if (seance!.salleNoms.isNotEmpty)
              Text(
                '📍 ${seance!.salleDisplay}',
                style: GoogleFonts.inter(
                  fontSize: 8,
                  color: textColor.withAlpha(160),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
          ],
        ),
      ),
    );
  }

  Color _getColor(bool isDark) {
    switch (seance!.type) {
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

  Color _getTextColor(bool isDark) {
    switch (seance!.type) {
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
