/// Calendar event DTO matching Spring Boot backend.

class EvenementCalendrierDto {
  final int id;
  final String titre;
  final String? description;
  final String type; // RENTREE, VACANCES, EXAMEN, FERIE, SOUTENANCE, EVENEMENT, AUTRE
  final String dateDebut; // yyyy-MM-dd
  final String? dateFin;
  final int? semestreId;
  final String? semestreLibelle;
  final String? couleur;

  const EvenementCalendrierDto({
    required this.id,
    required this.titre,
    this.description,
    required this.type,
    required this.dateDebut,
    this.dateFin,
    this.semestreId,
    this.semestreLibelle,
    this.couleur,
  });

  factory EvenementCalendrierDto.fromJson(Map<String, dynamic> json) {
    return EvenementCalendrierDto(
      id: json['id'] as int,
      titre: json['titre'] as String? ?? '',
      description: json['description'] as String?,
      type: json['type'] as String? ?? 'AUTRE',
      dateDebut: json['dateDebut'] as String? ?? '',
      dateFin: json['dateFin'] as String?,
      semestreId: json['semestreId'] as int?,
      semestreLibelle: json['semestreLibelle'] as String?,
      couleur: json['couleur'] as String?,
    );
  }

  /// Check if a given date (yyyy-MM-dd) falls within this event's range.
  bool coversDate(String isoDate) {
    final end = dateFin ?? dateDebut;
    return isoDate.compareTo(dateDebut) >= 0 && isoDate.compareTo(end) <= 0;
  }
}
