import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

/// Week navigation bar with left/right arrows and current week indicator
class WeekNavigator extends StatelessWidget {
  final int currentWeekOffset;
  final String semaine;
  final String dateDebut;
  final String dateFin;
  final ValueChanged<int> onWeekChanged;

  const WeekNavigator({
    super.key,
    required this.currentWeekOffset,
    required this.semaine,
    required this.dateDebut,
    required this.dateFin,
    required this.onWeekChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isCurrentWeek = currentWeekOffset == 0;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(14),
        border: isCurrentWeek
            ? Border.all(color: AppColors.primaryLight.withAlpha(100), width: 1.5)
            : null,
      ),
      child: Row(
        children: [
          // Previous week button
          _navButton(
            icon: Icons.chevron_left_rounded,
            onTap: () => onWeekChanged(currentWeekOffset - 1),
            isDark: isDark,
          ),
          const SizedBox(width: 4),

          // Week info
          Expanded(
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Semaine $semaine',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                      ),
                    ),
                    if (isCurrentWeek) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'actuelle',
                          style: GoogleFonts.inter(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  '$dateDebut — $dateFin',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(width: 4),
          // Next week button
          _navButton(
            icon: Icons.chevron_right_rounded,
            onTap: () => onWeekChanged(currentWeekOffset + 1),
            isDark: isDark,
          ),

          // Return to current week button (only shown when not on current week)
          if (!isCurrentWeek) ...[
            const SizedBox(width: 4),
            _navButton(
              icon: Icons.today_rounded,
              onTap: () => onWeekChanged(0),
              isDark: isDark,
              isAccent: true,
            ),
          ],
        ],
      ),
    );
  }

  Widget _navButton({
    required IconData icon,
    required VoidCallback onTap,
    required bool isDark,
    bool isAccent = false,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: isAccent
                ? AppColors.primaryLight.withAlpha(30)
                : (isDark ? AppColors.darkCard : Colors.white).withAlpha(180),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            icon,
            size: 20,
            color: isAccent
                ? AppColors.primaryLight
                : (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
          ),
        ),
      ),
    );
  }
}
