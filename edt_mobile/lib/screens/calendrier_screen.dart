import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/user.dart';
import '../models/evenement.dart';
import '../models/seance.dart';
import '../services/calendrier_service.dart';
import '../services/edt_service.dart';
import '../theme/app_theme.dart';

class CalendrierScreen extends StatefulWidget {
  final UserDto user;
  const CalendrierScreen({super.key, required this.user});
  @override
  State<CalendrierScreen> createState() => _CalendrierScreenState();
}

class _CalendrierScreenState extends State<CalendrierScreen> {
  final _calService = CalendrierService();
  final _edtService = EdtService();
  List<EvenementCalendrierDto> _events = [];
  List<SemestreDto> _semestres = [];
  String _selectedSemestreId = '';
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSemestres();
  }

  Future<void> _loadSemestres() async {
    try {
      final sems = await _edtService.getSemestres();
      if (!mounted) return;
      setState(() { _semestres = sems; });
      if (sems.isNotEmpty) {
        _selectedSemestreId = sems[0].id.toString();
        await _loadEvents();
      } else {
        setState(() => _loading = false);
      }
    } catch (e) {
      if (mounted) setState(() { _error = 'Erreur chargement'; _loading = false; });
    }
  }

  Future<void> _loadEvents() async {
    setState(() { _loading = true; _error = null; });
    try {
      final events = await _calService.getAll(semestreId: int.parse(_selectedSemestreId));
      events.sort((a, b) => a.dateDebut.compareTo(b.dateDebut));
      if (!mounted) return;
      setState(() { _events = events; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = 'Erreur chargement événements'; _loading = false; });
    }
  }

  Color _typeColor(String type) {
    switch (type) {
      case 'FERIE': return const Color(0xFFE53935);
      case 'VACANCES': return const Color(0xFF43A047);
      case 'EXAMEN': return const Color(0xFFFF8F00);
      case 'RENTREE': return const Color(0xFF1E88E5);
      case 'SOUTENANCE': return const Color(0xFF8E24AA);
      default: return AppColors.primaryLight;
    }
  }

  IconData _typeIcon(String type) {
    switch (type) {
      case 'FERIE': return Icons.celebration_rounded;
      case 'VACANCES': return Icons.beach_access_rounded;
      case 'EXAMEN': return Icons.assignment_rounded;
      case 'RENTREE': return Icons.school_rounded;
      case 'SOUTENANCE': return Icons.groups_rounded;
      default: return Icons.event_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      appBar: AppBar(
        title: Text('Calendrier', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        actions: [
          if (_semestres.length > 1)
            PopupMenuButton<String>(
              icon: const Icon(Icons.school_rounded),
              onSelected: (v) { _selectedSemestreId = v; _loadEvents(); },
              itemBuilder: (_) => _semestres.map((s) => PopupMenuItem(value: s.id.toString(), child: Text(s.libelle))).toList(),
            ),
        ],
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _error != null
          ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text(_error!, style: GoogleFonts.inter(color: AppColors.error)),
              const SizedBox(height: 12),
              ElevatedButton(onPressed: _loadEvents, child: const Text('Réessayer')),
            ]))
          : _events.isEmpty
            ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.event_busy_rounded, size: 64, color: (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary).withAlpha(100)),
                const SizedBox(height: 12),
                Text('Aucun événement', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary)),
              ]))
            : ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _events.length,
                itemBuilder: (ctx, i) => _buildEventCard(_events[i], isDark),
              ),
    );
  }

  Widget _buildEventCard(EvenementCalendrierDto ev, bool isDark) {
    final color = _typeColor(ev.type);
    final icon = _typeIcon(ev.type);
    final hasRange = ev.dateFin != null && ev.dateFin != ev.dateDebut;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border(left: BorderSide(color: color, width: 4)),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(isDark ? 30 : 10), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(color: color.withAlpha(25), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text(ev.titre, style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700, color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: color.withAlpha(20), borderRadius: BorderRadius.circular(6)),
                child: Text(ev.type, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: color)),
              ),
            ]),
            const SizedBox(height: 4),
            if (ev.description != null && ev.description!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(ev.description!, style: GoogleFonts.inter(fontSize: 13, color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary)),
              ),
            Row(children: [
              Icon(Icons.calendar_today_rounded, size: 13, color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
              const SizedBox(width: 4),
              Text(hasRange ? '${ev.dateDebut} → ${ev.dateFin}' : ev.dateDebut,
                style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary)),
            ]),
          ])),
        ]),
      ),
    );
  }
}
