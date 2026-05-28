import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

/// Small stat card for the statistics dashboard
class StatsCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color? color;

  const StatsCard({
    super.key,
    required this.icon,
    required this.value,
    required this.label,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final iconColor = color ?? AppColors.primaryLight;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 40 : 15),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, size: 22, color: iconColor),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            ),
          ),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

/// Expandable statistics dashboard showing week metrics
class StatsDashboard extends StatelessWidget {
  final Map<String, dynamic> stats;

  const StatsDashboard({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(
                Icons.bar_chart_rounded,
                size: 18,
                color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                'Statistiques de la semaine',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: StatsCard(
                  icon: Icons.schedule_rounded,
                  value: '${stats['totalHours']}h',
                  label: 'Total heures',
                  color: AppColors.primaryLight,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: StatsCard(
                  icon: Icons.class_rounded,
                  value: '${stats['totalSlots']}',
                  label: 'Séances',
                  color: const Color(0xFF1565C0),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: StatsCard(
                  icon: Icons.trending_up_rounded,
                  value: '${stats['busiestDay']}',
                  label: 'Jour chargé',
                  color: const Color(0xFFE65100),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Type breakdown bar
          _buildTypeBreakdownBar(isDark),
        ],
      ),
    );
  }

  Widget _buildTypeBreakdownBar(bool isDark) {
    final int cm = stats['cm'] ?? 0;
    final int td = stats['td'] ?? 0;
    final int tp = stats['tp'] ?? 0;
    final int total = cm + td + tp;
    if (total == 0) return const SizedBox.shrink();

    return Column(
      children: [
        // Bar
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: SizedBox(
            height: 10,
            child: Row(
              children: [
                Flexible(
                  flex: cm,
                  child: Container(color: const Color(0xFF1565C0)),
                ),
                Flexible(
                  flex: td,
                  child: Container(color: const Color(0xFF2E7D32)),
                ),
                Flexible(
                  flex: tp,
                  child: Container(color: const Color(0xFFE65100)),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 6),
        // Legend
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _legend('CM', cm, const Color(0xFF1565C0), isDark),
            const SizedBox(width: 14),
            _legend('TD', td, const Color(0xFF2E7D32), isDark),
            const SizedBox(width: 14),
            _legend('TP', tp, const Color(0xFFE65100), isDark),
          ],
        ),
      ],
    );
  }

  Widget _legend(String type, int count, Color color, bool isDark) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(
          '$type: $count',
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
