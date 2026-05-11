import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Central API client — Dio instance with JWT interceptor.
/// Change [baseUrl] to your PC's IP when testing on a physical device.
class ApiClient {
  static const String _baseUrl = 'http://10.34.12.1:8080/api';
  static const String _tokenKey = 'jwt_token';

  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio dio;

  ApiClient._internal() {
    dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));

    // ── Request interceptor: attach JWT token ──
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString(_tokenKey);
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Token expired or invalid — clear it
          final prefs = await SharedPreferences.getInstance();
          await prefs.remove(_tokenKey);
        }
        handler.next(error);
      },
    ));
  }

  // ── Token helpers ──────────────────────────────────────────────
  static Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  static Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
}
