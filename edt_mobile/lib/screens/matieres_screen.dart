import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/user.dart';
import '../models/matiere.dart';
import '../services/matiere_service.dart';
import '../theme/app_theme.dart';

class MatieresScreen extends StatefulWidget {
  final UserDto user;
  const MatieresScreen({super.key, required this.user});
  @override
  State<MatieresScreen> createState() => _MatieresScreenState();
}

class _MatieresScreenState extends State<MatieresScreen> {
  final _service = MatiereService();
  List<MatiereDto> _matieres = [];
  bool _loading = true;
  String? _error;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = widget.user.departementId != null
          ? await _service.getByDepartement(widget.user.departementId!)
          : await _service.getAll();
      if (!mounted) return;
      setState(() { _matieres = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = 'Erreur chargement matières'; _loading = false; });
    }
  }

  List<MatiereDto> get _filtered {
    if (_search.isEmpty) return _matieres;
    final q = _search.toLowerCase();
    return _matieres.where((m) => m.code.toLowerCase().contains(q) || m.intitule.toLowerCase().contains(q)).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      appBar: AppBar(title: Text('Matières', style: GoogleFonts.inter(fontWeight: FontWeight.w700))),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _error != null
          ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.error)))
          : Column(children: [
              // Search bar
              Padding(
                padding: const EdgeInsets.all(12),
                child: TextField(
                  onChanged: (v) => setState(() => _search = v),
                  decoration: InputDecoration(
                    hintText: 'Rechercher une matière...', prefixIcon: const Icon(Icons.search, size: 20),
                    isDense: true, filled: true, fillColor: isDark ? AppColors.darkCard : Colors.white,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                  style: GoogleFonts.inter(fontSize: 14),
                ),
              ),
              // Summary
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(children: [
                  Text('${_filtered.length} matière${_filtered.length > 1 ? 's' : ''}',
                    style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary)),
                  const Spacer(),
                  Text('${_filtered.fold<double>(0, (sum, m) => sum + m.totalHours).toStringAsFixed(0)}h total',
                    style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primaryLight)),
                ]),
              ),
              const SizedBox(height: 8),
              // List
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: _filtered.length,
                  itemBuilder: (ctx, i) => _buildCard(_filtered[i], isDark),
                ),
              ),
            ]),
    );
  }

  Widget _buildCard(MatiereDto m, bool isDark) {
    final typeColor = m.typeMatiere == 'HE' ? const Color(0xFF1565C0) : m.typeMatiere == 'ST' ? const Color(0xFFE65100) : AppColors.primary;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(isDark ? 30 : 10), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Text(m.code, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w800, color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary)),
          const SizedBox(width: 8),
          if (m.typeMatiere != null) Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: typeColor.withAlpha(30), borderRadius: BorderRadius.circular(6)),
            child: Text(m.typeMatiere!, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: typeColor)),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: AppColors.primaryLight.withAlpha(20), borderRadius: BorderRadius.circular(6)),
            child: Text('${m.credits} crédits', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryLight)),
          ),
        ]),
        const SizedBox(height: 6),
        Text(m.intitule, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary)),
        const SizedBox(height: 10),
        // Hours breakdown
        Row(children: [
          _hourBadge('CM', m.hCm, const Color(0xFF1565C0), isDark),
          const SizedBox(width: 8),
          _hourBadge('TD', m.hTd, const Color(0xFF2E7D32), isDark),
          const SizedBox(width: 8),
          _hourBadge('TP', m.hTp, const Color(0xFFE65100), isDark),
          const Spacer(),
          Text('${m.totalHours.toStringAsFixed(0)}h', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary)),
        ]),
      ]),
    );
  }

  Widget _hourBadge(String label, double hours, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withAlpha(isDark ? 40 : 20), borderRadius: BorderRadius.circular(8)),
      child: Text('$label: ${hours.toStringAsFixed(0)}h', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: color)),
    );
  }
}
