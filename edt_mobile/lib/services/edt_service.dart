import 'api_client.dart';
import '../models/seance.dart';

class EdtService {
  final _dio = ApiClient().dio;

  /// Get student's own EDT → GET /edt/me
  Future<EdtSemaineDto> getMyEdt(int semestreId, int numeroSemaine) async {
    final response = await _dio.get('/edt/me', queryParameters: {
      'semestreId': semestreId,
      'numeroSemaine': numeroSemaine,
    });
    return EdtSemaineDto.fromJson(response.data);
  }

  /// Get all semestres → GET /semestres
  Future<List<SemestreDto>> getSemestres() async {
    final response = await _dio.get('/semestres');
    return (response.data as List)
        .map((e) => SemestreDto.fromJson(e))
        .toList();
  }

  /// Get semaines for a semestre → GET /semaines?semestreId=X
  Future<List<SemaineAcademiqueDto>> getSemaines(int semestreId) async {
    final response = await _dio.get('/semaines', queryParameters: {
      'semestreId': semestreId,
    });
    return (response.data as List)
        .map((e) => SemaineAcademiqueDto.fromJson(e))
        .toList();
  }

  /// Get creneaux for a semestre → GET /creneaux?semestreId=X
  Future<List<CreneauDto>> getCreneaux(int semestreId) async {
    final response = await _dio.get('/creneaux', queryParameters: {
      'semestreId': semestreId,
    });
    return (response.data as List)
        .map((e) => CreneauDto.fromJson(e))
        .toList();
  }
}
