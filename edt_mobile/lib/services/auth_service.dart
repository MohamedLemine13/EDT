import 'api_client.dart';
import '../models/user.dart';

class AuthService {
  final _dio = ApiClient().dio;

  /// Login → POST /auth/login
  Future<AuthResponse> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    final auth = AuthResponse.fromJson(response.data);
    // Persist JWT
    await ApiClient.setToken(auth.token);
    return auth;
  }

  /// Get current user profile → GET /auth/me
  Future<UserDto> getMe() async {
    final response = await _dio.get('/auth/me');
    return UserDto.fromJson(response.data);
  }

  /// Logout — clear token
  Future<void> logout() async {
    await ApiClient.removeToken();
  }

  /// Check if authenticated
  Future<bool> isAuthenticated() async {
    return ApiClient.isAuthenticated();
  }
}
