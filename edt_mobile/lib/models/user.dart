/// User authentication and profile models matching Spring Boot backend.

class LoginRequest {
  final String email;
  final String password;

  const LoginRequest({required this.email, required this.password});

  Map<String, dynamic> toJson() => {'email': email, 'password': password};
}

class AuthResponse {
  final String token;
  final String tokenType;

  const AuthResponse({required this.token, required this.tokenType});

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'] as String,
      tokenType: json['tokenType'] as String? ?? 'Bearer',
    );
  }
}

class UserDto {
  final int id;
  final String nom;
  final String prenom;
  final String email;
  final String role;
  final int? departementId;
  final bool mustChangePassword;

  const UserDto({
    required this.id,
    required this.nom,
    required this.prenom,
    required this.email,
    required this.role,
    this.departementId,
    this.mustChangePassword = false,
  });

  factory UserDto.fromJson(Map<String, dynamic> json) {
    return UserDto(
      id: json['id'] as int,
      nom: json['nom'] as String? ?? '',
      prenom: json['prenom'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? 'ETUDIANT',
      departementId: json['departementId'] as int?,
      mustChangePassword: json['mustChangePassword'] as bool? ?? false,
    );
  }

  String get displayName => '$prenom $nom';
  String get initials =>
      '${prenom.isNotEmpty ? prenom[0].toUpperCase() : ''}${nom.isNotEmpty ? nom[0].toUpperCase() : ''}';
}
