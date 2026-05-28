import 'api_client.dart';
import '../models/matiere.dart';

class MatiereService {
  final _dio = ApiClient().dio;

  /// Get all matières → GET /matieres
  Future<List<MatiereDto>> getAll() async {
    final response = await _dio.get('/matieres');
    return (response.data as List)
        .map((e) => MatiereDto.fromJson(e))
        .toList();
  }

  /// Get matières by department → GET /matieres?departementId=X
  Future<List<MatiereDto>> getByDepartement(int departementId) async {
    final response = await _dio.get('/matieres', queryParameters: {
      'departementId': departementId,
    });
    return (response.data as List)
        .map((e) => MatiereDto.fromJson(e))
        .toList();
  }
}
