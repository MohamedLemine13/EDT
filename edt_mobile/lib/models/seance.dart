/// All schedule-related DTOs matching the Spring Boot backend.

/// Represents a single session in the timetable (from SeanceDto).
class SeanceDto {
  final int id;
  final String type; // CM, TD, TP, DEVOIR, EXAMEN, MEETING, AUTRE
  final String statut; // PLANIFIEE, ANNULEE, REALISEE
  final String jour; // LUNDI, MARDI, ...
  final String heureDebut;
  final String heureFin;
  final String typeCreneau; // HE, ST, DEP, AUTRE
  final String matiereCode;
  final String matiereIntitule;
  final List<int> professeurIds;
  final List<String> professeurNoms;
  final List<int> salleIds;
  final List<String> salleNoms;
  final int semaineId;
  final int numeroSemaine;
  final String? tag;
  final List<int> departementIds;

  const SeanceDto({
    required this.id,
    required this.type,
    required this.statut,
    required this.jour,
    required this.heureDebut,
    required this.heureFin,
    required this.typeCreneau,
    required this.matiereCode,
    required this.matiereIntitule,
    required this.professeurIds,
    required this.professeurNoms,
    required this.salleIds,
    required this.salleNoms,
    required this.semaineId,
    required this.numeroSemaine,
    this.tag,
    required this.departementIds,
  });

  factory SeanceDto.fromJson(Map<String, dynamic> json) {
    return SeanceDto(
      id: json['id'] as int,
      type: json['type'] as String? ?? 'CM',
      statut: json['statut'] as String? ?? 'PLANIFIEE',
      jour: json['jour'] as String? ?? 'LUNDI',
      heureDebut: json['heureDebut'] as String? ?? '',
      heureFin: json['heureFin'] as String? ?? '',
      typeCreneau: json['typeCreneau'] as String? ?? 'DEP',
      matiereCode: json['matiereCode'] as String? ?? '',
      matiereIntitule: json['matiereIntitule'] as String? ?? '',
      professeurIds: (json['professeurIds'] as List?)?.map((e) => e as int).toList() ?? [],
      professeurNoms: (json['professeurNoms'] as List?)?.map((e) => e as String).toList() ?? [],
      salleIds: (json['salleIds'] as List?)?.map((e) => e as int).toList() ?? [],
      salleNoms: (json['salleNoms'] as List?)?.map((e) => e as String).toList() ?? [],
      semaineId: json['semaineId'] as int? ?? 0,
      numeroSemaine: json['numeroSemaine'] as int? ?? 0,
      tag: json['tag'] as String?,
      departementIds: (json['departementIds'] as List?)?.map((e) => e as int).toList() ?? [],
    );
  }

  /// Convenience: salle display string
  String get salleDisplay => salleNoms.isNotEmpty ? salleNoms.join(', ') : 'En ligne';

  /// Convenience: professeur display string
  String get professeurDisplay => professeurNoms.isNotEmpty ? professeurNoms.join(', ') : '';

  /// Convenience: time slot label
  String get creneauLabel => '$heureDebut-$heureFin';
}

/// A day's worth of sessions.
class EdtJourDto {
  final String jour; // LUNDI, MARDI, ...
  final List<SeanceDto> seances;

  const EdtJourDto({required this.jour, required this.seances});

  factory EdtJourDto.fromJson(Map<String, dynamic> json) {
    return EdtJourDto(
      jour: json['jour'] as String? ?? 'LUNDI',
      seances: (json['seances'] as List?)
              ?.map((e) => SeanceDto.fromJson(e))
              .toList() ??
          [],
    );
  }
}

/// A full week EDT response.
class EdtSemaineDto {
  final int semestreId;
  final String semestreLibelle;
  final int semaineId;
  final int numeroSemaine;
  final String dateDebut;
  final String dateFin;
  final int departementId;
  final String departementCode;
  final String departementNom;
  final List<EdtJourDto> jours;

  const EdtSemaineDto({
    required this.semestreId,
    required this.semestreLibelle,
    required this.semaineId,
    required this.numeroSemaine,
    required this.dateDebut,
    required this.dateFin,
    required this.departementId,
    required this.departementCode,
    required this.departementNom,
    required this.jours,
  });

  factory EdtSemaineDto.fromJson(Map<String, dynamic> json) {
    return EdtSemaineDto(
      semestreId: json['semestreId'] as int? ?? 0,
      semestreLibelle: json['semestreLibelle'] as String? ?? '',
      semaineId: json['semaineId'] as int? ?? 0,
      numeroSemaine: json['numeroSemaine'] as int? ?? 0,
      dateDebut: json['dateDebut'] as String? ?? '',
      dateFin: json['dateFin'] as String? ?? '',
      departementId: json['departementId'] as int? ?? 0,
      departementCode: json['departementCode'] as String? ?? '',
      departementNom: json['departementNom'] as String? ?? '',
      jours: (json['jours'] as List?)
              ?.map((e) => EdtJourDto.fromJson(e))
              .toList() ??
          [],
    );
  }

  /// Get all seances across all days as a flat list.
  List<SeanceDto> get allSeances => jours.expand((j) => j.seances).toList();
}

/// Semestre DTO.
class SemestreDto {
  final int id;
  final String libelle;
  final String dateDebut;
  final String dateFin;

  const SemestreDto({
    required this.id,
    required this.libelle,
    required this.dateDebut,
    required this.dateFin,
  });

  factory SemestreDto.fromJson(Map<String, dynamic> json) {
    return SemestreDto(
      id: json['id'] as int,
      libelle: json['libelle'] as String? ?? '',
      dateDebut: json['dateDebut'] as String? ?? '',
      dateFin: json['dateFin'] as String? ?? '',
    );
  }
}

/// Academic week DTO.
class SemaineAcademiqueDto {
  final int id;
  final int numeroSemaine;
  final String dateDebut;
  final String dateFin;
  final int semestreId;

  const SemaineAcademiqueDto({
    required this.id,
    required this.numeroSemaine,
    required this.dateDebut,
    required this.dateFin,
    required this.semestreId,
  });

  factory SemaineAcademiqueDto.fromJson(Map<String, dynamic> json) {
    return SemaineAcademiqueDto(
      id: json['id'] as int,
      numeroSemaine: json['numeroSemaine'] as int? ?? 0,
      dateDebut: json['dateDebut'] as String? ?? '',
      dateFin: json['dateFin'] as String? ?? '',
      semestreId: json['semestreId'] as int? ?? 0,
    );
  }
}

/// Creneau (time slot) DTO.
class CreneauDto {
  final int id;
  final String jour; // LUNDI, MARDI, ...
  final String heureDebut;
  final String heureFin;
  final String typeCreneau; // DEP, HE, ST, AUTRE
  final int semestreId;

  const CreneauDto({
    required this.id,
    required this.jour,
    required this.heureDebut,
    required this.heureFin,
    required this.typeCreneau,
    required this.semestreId,
  });

  factory CreneauDto.fromJson(Map<String, dynamic> json) {
    return CreneauDto(
      id: json['id'] as int,
      jour: json['jour'] as String? ?? 'LUNDI',
      heureDebut: json['heureDebut'] as String? ?? '',
      heureFin: json['heureFin'] as String? ?? '',
      typeCreneau: json['typeCreneau'] as String? ?? 'DEP',
      semestreId: json['semestreId'] as int? ?? 0,
    );
  }
}

/// Time slot helper for display purposes.
class TimeSlotInfo {
  final String label; // "09:00-10:15"
  final String start;
  final String end;

  const TimeSlotInfo({
    required this.label,
    required this.start,
    required this.end,
  });
}
