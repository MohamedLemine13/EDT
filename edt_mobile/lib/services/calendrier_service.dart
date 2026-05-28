import 'api_client.dart';
import '../models/evenement.dart';

class CalendrierService {
  final _dio = ApiClient().dio;

  /// Get calendar events → GET /calendrier?semestreId=X
  Future<List<EvenementCalendrierDto>> getAll({int? semestreId}) async {
    final Map<String, dynamic> params = {};
    if (semestreId != null) params['semestreId'] = semestreId;
    final response = await _dio.get('/calendrier', queryParameters: params);
    return (response.data as List)
        .map((e) => EvenementCalendrierDto.fromJson(e))
        .toList();
  }
}
