import 'dart:typed_data';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:screenshot/screenshot.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import '../models/seance.dart';
import '../models/user.dart';
import '../models/evenement.dart';
import '../services/edt_service.dart';
import '../services/calendrier_service.dart';
import '../theme/app_theme.dart';
import '../main.dart';
import '../widgets/seance_card.dart';
import '../widgets/table_cell_widget.dart';
import '../widgets/week_navigator.dart';
import '../widgets/search_filter_bar.dart';
import '../widgets/stats_card.dart';
import '../widgets/seance_detail_sheet.dart';

enum ViewMode { card, table }

const List<String> _daysOrder = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI'];
const Map<String,String> _dayLabels = {
  'LUNDI':'Lundi','MARDI':'Mardi','MERCREDI':'Mercredi',
  'JEUDI':'Jeudi','VENDREDI':'Vendredi','SAMEDI':'Samedi',
};

class EdtScreen extends StatefulWidget {
  final UserDto user;
  const EdtScreen({super.key, required this.user});
  @override
  State<EdtScreen> createState() => _EdtScreenState();
}

class _EdtScreenState extends State<EdtScreen> {
  final _edtService = EdtService();
  final _calService = CalendrierService();
  final _screenshotCtrl = ScreenshotController();

  List<SemestreDto> _semestres = [];
  List<SemaineAcademiqueDto> _semaines = [];
  List<EvenementCalendrierDto> _events = [];
  EdtSemaineDto? _edtData;
  List<TimeSlotInfo> _timeSlots = [];

  String _selectedSemestreId = '';
  int _selectedSemaineIdx = 0;
  int _selectedDayIndex = 0;
  bool _loading = true;
  bool _showStats = false;
  String? _error;
  String _searchQuery = '';
  Set<String> _typeFilter = {};
  ViewMode _viewMode = ViewMode.card;

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
        await _loadSemaines();
      }
    } catch (e) {
      if (mounted) setState(() { _error = 'Erreur chargement semestres'; _loading = false; });
    }
  }

  Future<void> _loadSemaines() async {
    try {
      final semId = int.parse(_selectedSemestreId);
      final results = await Future.wait([
        _edtService.getSemaines(semId),
        _edtService.getCreneaux(semId),
        _calService.getAll(semestreId: semId),
      ]);
      final semaines = (results[0] as List<SemaineAcademiqueDto>)
        ..sort((a,b) => a.numeroSemaine.compareTo(b.numeroSemaine));
      final creneaux = results[1] as List<CreneauDto>;
      final events = results[2] as List<EvenementCalendrierDto>;

      // Build unique time slots from creneaux
      final slotMap = <String, TimeSlotInfo>{};
      for (final c in creneaux) {
        final key = '${c.heureDebut}-${c.heureFin}';
        slotMap.putIfAbsent(key, () => TimeSlotInfo(label: key, start: c.heureDebut, end: c.heureFin));
      }
      final slots = slotMap.values.toList()..sort((a,b) => a.start.compareTo(b.start));

      if (!mounted) return;
      setState(() {
        _semaines = semaines;
        _events = events;
        _timeSlots = slots;
        _selectedSemaineIdx = 0;
      });
      if (semaines.isNotEmpty) await _loadEdt();
    } catch (e) {
      if (mounted) setState(() { _error = 'Erreur chargement semaines'; _loading = false; });
    }
  }

  Future<void> _loadEdt() async {
    if (_semaines.isEmpty) return;
    setState(() { _loading = true; _error = null; });
    try {
      final semId = int.parse(_selectedSemestreId);
      final numSemaine = _semaines[_selectedSemaineIdx].numeroSemaine;
      final data = await _edtService.getMyEdt(semId, numSemaine);
      if (!mounted) return;
      setState(() { _edtData = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = 'Erreur chargement EDT'; _loading = false; });
    }
  }

  List<SeanceDto> _getSeancesForDay(String day) {
    if (_edtData == null) return [];
    final jour = _edtData!.jours.where((j) => j.jour == day);
    if (jour.isEmpty) return [];
    var seances = jour.first.seances.toList();
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      seances = seances.where((s) =>
        s.matiereCode.toLowerCase().contains(q) ||
        s.matiereIntitule.toLowerCase().contains(q) ||
        s.professeurDisplay.toLowerCase().contains(q) ||
        s.salleDisplay.toLowerCase().contains(q)
      ).toList();
    }
    if (_typeFilter.isNotEmpty) {
      seances = seances.where((s) => _typeFilter.contains(s.type)).toList();
    }
    return seances;
  }

  SeanceDto? _getSeanceAt(String day, String start, String end) {
    final seances = _getSeancesForDay(day);
    try {
      return seances.firstWhere((s) => s.heureDebut == start && s.heureFin == end);
    } catch (_) { return null; }
  }

  EvenementCalendrierDto? _getHolidayForDay(String dayName) {
    if (_semaines.isEmpty || _selectedSemaineIdx >= _semaines.length) return null;
    final sem = _semaines[_selectedSemaineIdx];
    final offsets = {'LUNDI':0,'MARDI':1,'MERCREDI':2,'JEUDI':3,'VENDREDI':4,'SAMEDI':5};
    final offset = offsets[dayName] ?? 0;
    final parts = sem.dateDebut.split('-').map(int.parse).toList();
    if (parts.length < 3) return null;
    final dayDate = DateTime(parts[0], parts[1], parts[2]).add(Duration(days: offset));
    final iso = '${dayDate.year}-${dayDate.month.toString().padLeft(2,'0')}-${dayDate.day.toString().padLeft(2,'0')}';
    try {
      return _events.firstWhere((ev) => ev.coversDate(iso));
    } catch (_) { return null; }
  }

  Map<String, dynamic> _getWeekStats() {
    if (_edtData == null) return {'totalSlots':0,'totalHours':0.0,'cm':0,'td':0,'tp':0,'busiestDay':'—','busiestDayCount':0};
    final all = _edtData!.allSeances;
    int cm = all.where((s) => s.type == 'CM').length;
    int td = all.where((s) => s.type == 'TD').length;
    int tp = all.where((s) => s.type == 'TP').length;
    String busiestDay = '—'; int maxC = 0;
    for (final d in _daysOrder) {
      final c = all.where((s) => s.jour == d).length;
      if (c > maxC) { maxC = c; busiestDay = _dayLabels[d] ?? d; }
    }
    return {'totalSlots':all.length,'totalHours':all.length*1.25,'cm':cm,'td':td,'tp':tp,'busiestDay':busiestDay,'busiestDayCount':maxC};
  }

  void _onWeekChanged(int delta) {
    final newIdx = _selectedSemaineIdx + delta;
    if (newIdx < 0 || newIdx >= _semaines.length) return;
    setState(() => _selectedSemaineIdx = newIdx);
    _loadEdt();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      appBar: AppBar(
        title: Text('Emploi du Temps', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        actions: [
          if (_semestres.length > 1)
            PopupMenuButton<String>(
              icon: const Icon(Icons.school_rounded),
              onSelected: (v) { _selectedSemestreId = v; _loadSemaines(); },
              itemBuilder: (_) => _semestres.map((s) => PopupMenuItem(value: s.id.toString(), child: Text(s.libelle))).toList(),
            ),
          IconButton(icon: Icon(_showStats ? Icons.bar_chart_rounded : Icons.bar_chart_outlined), onPressed: () => setState(() => _showStats = !_showStats)),
          IconButton(icon: const Icon(Icons.share_rounded), onPressed: _exportSchedule),
          IconButton(
            icon: Icon(isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded),
            onPressed: () => themeNotifier.value = isDark ? ThemeMode.light : ThemeMode.dark,
          ),
        ],
      ),
      body: Screenshot(
        controller: _screenshotCtrl,
        child: Container(
          color: isDark ? AppColors.darkBackground : AppColors.background,
          child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
              ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.error_outline, size: 48, color: AppColors.error),
                  const SizedBox(height: 12),
                  Text(_error!, style: GoogleFonts.inter(fontSize: 16, color: AppColors.error)),
                  const SizedBox(height: 12),
                  ElevatedButton(onPressed: _loadEdt, child: const Text('Réessayer')),
                ]))
              : Column(children: [
                  _buildHeader(isDark),
                  if (_semaines.isNotEmpty) WeekNavigator(
                    currentWeekOffset: 0,
                    semaine: _semaines[_selectedSemaineIdx].numeroSemaine.toString(),
                    dateDebut: _semaines[_selectedSemaineIdx].dateDebut,
                    dateFin: _semaines[_selectedSemaineIdx].dateFin,
                    onWeekChanged: (offset) => _onWeekChanged(offset),
                  ),
                  SearchFilterBar(searchQuery: _searchQuery, activeFilters: _typeFilter,
                    onSearchChanged: (q) => setState(() => _searchQuery = q),
                    onFiltersChanged: (f) => setState(() => _typeFilter = f)),
                  if (_showStats) StatsDashboard(stats: _getWeekStats()),
                  Expanded(child: _viewMode == ViewMode.card ? _buildCardView(isDark) : _buildTableView(isDark)),
                ]),
        ),
      ),
      floatingActionButton: FloatingActionButton.small(
        backgroundColor: AppColors.primaryLight, foregroundColor: Colors.white,
        onPressed: () => setState(() => _viewMode = _viewMode == ViewMode.card ? ViewMode.table : ViewMode.card),
        child: Icon(_viewMode == ViewMode.card ? Icons.grid_on_rounded : Icons.view_agenda_rounded),
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    final info = _edtData;
    return Container(
      width: double.infinity, margin: const EdgeInsets.all(12), padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: isDark ? [const Color(0xFF0D3B11), const Color(0xFF1B4A20)] : [const Color(0xFF1B5E20), const Color(0xFF388E3C)]),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(children: [
        Text(info?.departementNom ?? 'Chargement...', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
        if (info != null) Text('(${info.departementCode})', style: GoogleFonts.inter(color: Colors.white.withAlpha(200), fontSize: 13)),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(color: Colors.white.withAlpha(30), borderRadius: BorderRadius.circular(8)),
          child: Text(info?.semestreLibelle ?? '', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
        ),
      ]),
    );
  }

  Widget _buildCardView(bool isDark) {
    return Column(children: [
      _buildDayTabs(isDark),
      Expanded(child: _buildDaySchedule(_daysOrder[_selectedDayIndex], isDark)),
    ]);
  }

  Widget _buildDayTabs(bool isDark) {
    return Container(
      height: 48, margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant, borderRadius: BorderRadius.circular(14)),
      child: Row(children: List.generate(_daysOrder.length, (i) {
        final isSelected = i == _selectedDayIndex;
        final holiday = _getHolidayForDay(_daysOrder[i]);
        return Expanded(child: GestureDetector(
          onTap: () => setState(() => _selectedDayIndex = i),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250), margin: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: holiday != null ? Colors.grey.withAlpha(60) : (isSelected ? AppColors.primary : Colors.transparent),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Text(_dayLabels[_daysOrder[i]]!.substring(0, 3),
              style: GoogleFonts.inter(color: isSelected ? Colors.white : (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                fontSize: 13, fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500)),
          ),
        ));
      })),
    );
  }

  Widget _buildDaySchedule(String day, bool isDark) {
    final holiday = _getHolidayForDay(day);
    if (holiday != null) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.celebration_rounded, size: 64, color: AppColors.primaryLight),
        const SizedBox(height: 12),
        Text(holiday.titre, style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary)),
        Text('Jour férié', style: GoogleFonts.inter(fontSize: 14, color: AppColors.textSecondary)),
      ]));
    }
    final seances = _getSeancesForDay(day);
    if (seances.isEmpty) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.event_available_rounded, size: 64, color: (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary).withAlpha(100)),
        const SizedBox(height: 12),
        Text('Pas de cours', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary)),
      ]));
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      itemCount: _timeSlots.length,
      itemBuilder: (ctx, idx) {
        final slot = _timeSlots[idx];
        final seance = _getSeanceAt(day, slot.start, slot.end);
        return Padding(padding: const EdgeInsets.only(bottom: 8), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(width: 58, child: Column(children: [
            Text(slot.start, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
            Text(slot.end, style: GoogleFonts.inter(fontSize: 11, color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary)),
          ])),
          const SizedBox(width: 8),
          Expanded(child: seance != null
            ? SeanceCard(seance: seance, onTap: () => SeanceDetailSheet.show(context, seance))
            : Container(height: 60, decoration: BoxDecoration(
                color: (isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant).withAlpha(128),
                borderRadius: BorderRadius.circular(14), border: Border.all(color: (isDark ? AppColors.darkBorder : AppColors.border).withAlpha(80))),
              alignment: Alignment.center, child: Text('—', style: GoogleFonts.inter(fontSize: 16, color: (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary).withAlpha(100))))),
        ]));
      },
    );
  }

  Widget _buildTableView(bool isDark) {
    return InteractiveViewer(
      constrained: false, boundaryMargin: const EdgeInsets.all(40), minScale: 0.5, maxScale: 3.0,
      child: Padding(padding: const EdgeInsets.all(12), child: Table(
        defaultColumnWidth: const FixedColumnWidth(124),
        columnWidths: const {0: FixedColumnWidth(70)},
        children: [
          TableRow(
            decoration: BoxDecoration(color: isDark ? AppColors.darkSurface : AppColors.primary, borderRadius: const BorderRadius.vertical(top: Radius.circular(12))),
            children: [
              Container(height: 44, alignment: Alignment.center, child: Icon(Icons.schedule_rounded, size: 18, color: isDark ? AppColors.darkTextSecondary : Colors.white.withAlpha(200))),
              ..._daysOrder.map((d) => Container(height: 44, alignment: Alignment.center, child: Text(_dayLabels[d]!.substring(0, 3), style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: isDark ? AppColors.darkTextPrimary : Colors.white)))),
            ],
          ),
          ..._timeSlots.map((slot) => TableRow(children: [
            Container(height: 76, alignment: Alignment.center, child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Text(slot.start, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: isDark ? AppColors.darkTextPrimary : AppColors.primary)),
              Text(slot.end, style: GoogleFonts.inter(fontSize: 10, color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary)),
            ])),
            ..._daysOrder.map((day) {
              final holiday = _getHolidayForDay(day);
              final seance = _getSeanceAt(day, slot.start, slot.end);
              return TableCellWidget(seance: seance, isHoliday: holiday != null, holidayTitle: holiday?.titre,
                onTap: seance != null ? () => SeanceDetailSheet.show(context, seance) : null);
            }),
          ])),
        ],
      )),
    );
  }

  Future<void> _exportSchedule() async {
    try {
      final Uint8List? bytes = await _screenshotCtrl.capture(delay: const Duration(milliseconds: 100), pixelRatio: 2.0);
      if (bytes == null) return;
      final dir = await getTemporaryDirectory();
      final file = File('${dir.path}/edt_semaine.png');
      await file.writeAsBytes(bytes);
      await Share.shareXFiles([XFile(file.path)], text: 'EDT Mobile');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur export: $e'), backgroundColor: AppColors.error));
    }
  }
}
