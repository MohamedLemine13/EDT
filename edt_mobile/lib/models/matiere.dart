/// Matière DTO matching Spring Boot backend.

class MatiereDto {
  final String code;
  final String intitule;
  final int credits;
  final double hCm;
  final double hTd;
  final double hTp;
  final String? typeMatiere; // DEP, HE, ST

  const MatiereDto({
    required this.code,
    required this.intitule,
    required this.credits,
    required this.hCm,
    required this.hTd,
    required this.hTp,
    this.typeMatiere,
  });

  factory MatiereDto.fromJson(Map<String, dynamic> json) {
    return MatiereDto(
      code: json['code'] as String? ?? '',
      intitule: json['intitule'] as String? ?? '',
      credits: (json['credits'] as num?)?.toInt() ?? 0,
      hCm: (json['hCm'] as num?)?.toDouble() ?? 0,
      hTd: (json['hTd'] as num?)?.toDouble() ?? 0,
      hTp: (json['hTp'] as num?)?.toDouble() ?? 0,
      typeMatiere: json['typeMatiere'] as String?,
    );
  }

  double get totalHours => hCm + hTd + hTp;
}
