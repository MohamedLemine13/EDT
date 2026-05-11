import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

/// Search bar with collapsible filter chips for CM/TD/TP
class SearchFilterBar extends StatefulWidget {
  final String searchQuery;
  final Set<String> activeFilters;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<Set<String>> onFiltersChanged;

  const SearchFilterBar({
    super.key,
    required this.searchQuery,
    required this.activeFilters,
    required this.onSearchChanged,
    required this.onFiltersChanged,
  });

  @override
  State<SearchFilterBar> createState() => _SearchFilterBarState();
}

class _SearchFilterBarState extends State<SearchFilterBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _expandAnim;
  bool _isExpanded = false;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _expandAnim = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutCubic,
    );
    // Start expanded if there are active filters or a search query
    if (widget.searchQuery.isNotEmpty || widget.activeFilters.isNotEmpty) {
      _isExpanded = true;
      _animController.value = 1.0;
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _toggleExpanded() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _animController.forward();
      } else {
        _animController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          // Search toggle button
          InkWell(
            onTap: _toggleExpanded,
            borderRadius: BorderRadius.circular(14),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              child: Row(
                children: [
                  Icon(
                    Icons.search_rounded,
                    size: 20,
                    color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Rechercher & filtrer',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                    ),
                  ),
                  const Spacer(),
                  if (widget.searchQuery.isNotEmpty || widget.activeFilters.isNotEmpty)
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.primaryLight,
                        shape: BoxShape.circle,
                      ),
                    ),
                  const SizedBox(width: 4),
                  AnimatedRotation(
                    turns: _isExpanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 300),
                    child: Icon(
                      Icons.expand_more_rounded,
                      size: 20,
                      color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Expandable content
          SizeTransition(
            sizeFactor: _expandAnim,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
              child: Column(
                children: [
                  // Search field
                  TextField(
                    onChanged: widget.onSearchChanged,
                    decoration: InputDecoration(
                      hintText: 'Matière, professeur, salle...',
                      hintStyle: GoogleFonts.inter(fontSize: 13),
                      prefixIcon: const Icon(Icons.search, size: 18),
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                      filled: true,
                      fillColor: isDark ? AppColors.darkCard : Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    style: GoogleFonts.inter(fontSize: 13),
                  ),
                  const SizedBox(height: 8),

                  // Filter chips
                  Row(
                    children: [
                      Text(
                        'Type: ',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(width: 4),
                      _filterChip('CM', const Color(0xFF1565C0), isDark),
                      const SizedBox(width: 6),
                      _filterChip('TD', const Color(0xFF2E7D32), isDark),
                      const SizedBox(width: 6),
                      _filterChip('TP', const Color(0xFFE65100), isDark),
                      const Spacer(),
                      if (widget.activeFilters.isNotEmpty)
                        GestureDetector(
                          onTap: () => widget.onFiltersChanged({}),
                          child: Text(
                            'Réinitialiser',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.primaryLight,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String type, Color color, bool isDark) {
    final isActive = widget.activeFilters.contains(type);

    return GestureDetector(
      onTap: () {
        final newFilters = Set<String>.from(widget.activeFilters);
        if (isActive) {
          newFilters.remove(type);
        } else {
          newFilters.add(type);
        }
        widget.onFiltersChanged(newFilters);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isActive ? color : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isActive ? color : (isDark ? AppColors.darkBorder : AppColors.border),
            width: 1.5,
          ),
        ),
        child: Text(
          type,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isActive
                ? Colors.white
                : (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
          ),
        ),
      ),
    );
  }
}
