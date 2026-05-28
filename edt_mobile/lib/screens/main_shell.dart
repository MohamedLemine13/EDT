import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../main.dart';
import 'edt_screen.dart';
import 'matieres_screen.dart';
import 'calendrier_screen.dart';
import 'login_screen.dart';

/// Main navigation shell with a Drawer sidebar and bottom navigation.
/// Mirrors the web app's student view: Mon EDT, Matières, Calendrier.
class MainShell extends StatefulWidget {
  final UserDto user;

  const MainShell({super.key, required this.user});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;
  final _authService = AuthService();

  late final List<_NavItem> _navItems;

  @override
  void initState() {
    super.initState();
    _navItems = [
      _NavItem(
        title: 'Mon EDT',
        icon: Icons.calendar_month_rounded,
        screen: EdtScreen(user: widget.user),
      ),
      _NavItem(
        title: 'Matières',
        icon: Icons.menu_book_rounded,
        screen: MatieresScreen(user: widget.user),
      ),
      _NavItem(
        title: 'Calendrier',
        icon: Icons.event_rounded,
        screen: CalendrierScreen(user: widget.user),
      ),
    ];
  }

  void _onLogout() async {
    await _authService.logout();
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _navItems.map((item) => item.screen).toList(),
      ),
      drawer: _buildDrawer(isDark),
      bottomNavigationBar: _buildBottomNav(isDark),
    );
  }

  // ── DRAWER (Sidebar) ──────────────────────────────────────────
  Widget _buildDrawer(bool isDark) {
    return Drawer(
      backgroundColor: isDark ? AppColors.darkSurface : Colors.white,
      child: Column(
        children: [
          // Drawer header with user info and green gradient
          Container(
            width: double.infinity,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 24,
              left: 20,
              right: 20,
              bottom: 24,
            ),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF0D3B11),
                  Color(0xFF1B5E20),
                  Color(0xFF2E7D32),
                ],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Avatar
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(30),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withAlpha(50), width: 1.5),
                  ),
                  child: Center(
                    child: Text(
                      widget.user.initials,
                      style: GoogleFonts.inter(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  widget.user.displayName,
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.user.email,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: Colors.white.withAlpha(178),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(25),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Étudiant',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Colors.white.withAlpha(200),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Section title
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
            child: Row(
              children: [
                Icon(
                  Icons.school_rounded,
                  size: 16,
                  color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                ),
                const SizedBox(width: 8),
                Text(
                  'MON ESPACE',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                    color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),

          // Nav items
          ...List.generate(_navItems.length, (i) {
            final item = _navItems[i];
            final isActive = _currentIndex == i;
            return ListTile(
              leading: Icon(
                item.icon,
                color: isActive
                    ? AppColors.primary
                    : (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
              ),
              title: Text(
                item.title,
                style: GoogleFonts.inter(
                  fontSize: 15,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                  color: isActive
                      ? AppColors.primary
                      : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
                ),
              ),
              selected: isActive,
              selectedTileColor: AppColors.primary.withAlpha(20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 20),
              onTap: () {
                setState(() => _currentIndex = i);
                Navigator.pop(context); // Close drawer
              },
            );
          }),

          const Divider(indent: 20, endIndent: 20),

          // Dark mode toggle
          ListTile(
            leading: Icon(
              isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
            ),
            title: Text(
              isDark ? 'Mode clair' : 'Mode sombre',
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 20),
            onTap: () {
              themeNotifier.value = isDark ? ThemeMode.light : ThemeMode.dark;
            },
          ),

          const Spacer(),

          // Logout
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _onLogout,
                icon: const Icon(Icons.logout_rounded, size: 18),
                label: Text(
                  'Déconnexion',
                  style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.error,
                  side: const BorderSide(color: AppColors.error),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── BOTTOM NAVIGATION BAR ──────────────────────────────────────
  Widget _buildBottomNav(bool isDark) {
    return NavigationBar(
      selectedIndex: _currentIndex,
      onDestinationSelected: (i) => setState(() => _currentIndex = i),
      backgroundColor: isDark ? AppColors.darkSurface : Colors.white,
      indicatorColor: AppColors.primary.withAlpha(30),
      destinations: _navItems.map((item) {
        return NavigationDestination(
          icon: Icon(item.icon),
          selectedIcon: Icon(item.icon, color: AppColors.primary),
          label: item.title,
        );
      }).toList(),
    );
  }
}

class _NavItem {
  final String title;
  final IconData icon;
  final Widget screen;

  const _NavItem({
    required this.title,
    required this.icon,
    required this.screen,
  });
}
