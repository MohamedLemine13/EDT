import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import 'main_shell.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _errorMessage;

  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  final _authService = AuthService();

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _fadeAnim = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOut,
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutCubic,
    ));
    _animController.forward();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _animController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final email = _emailController.text.trim().toLowerCase();
      final password = _passwordController.text;

      // Real API login
      await _authService.login(email, password);

      // Fetch user profile
      final user = await _authService.getMe();

      // Only allow ETUDIANT role
      if (user.role != 'ETUDIANT') {
        await _authService.logout();
        setState(() {
          _isLoading = false;
          _errorMessage = 'Accès réservé aux étudiants';
        });
        return;
      }

      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => MainShell(user: user)),
      );
    } catch (e) {
      setState(() {
        _isLoading = false;
        if (e.toString().contains('401') || e.toString().contains('403')) {
          _errorMessage = 'Email ou mot de passe incorrect';
        } else if (e.toString().contains('SocketException') ||
            e.toString().contains('Connection refused') ||
            e.toString().contains('DioException')) {
          _errorMessage = 'Impossible de se connecter au serveur';
        } else {
          _errorMessage = 'Erreur de connexion: ${e.toString().split(':').last.trim()}';
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0D3B11),
              Color(0xFF1B5E20),
              Color(0xFF2E7D32),
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: FadeTransition(
                opacity: _fadeAnim,
                child: SlideTransition(
                  position: _slideAnim,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Logo / Icon
                      Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(30),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: Colors.white.withAlpha(50),
                            width: 1.5,
                          ),
                        ),
                        child: const Icon(
                          Icons.calendar_month_rounded,
                          size: 48,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Title
                      Text(
                        'EDT Mobile',
                        style: GoogleFonts.inter(
                          fontSize: 32,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Emploi du temps étudiant',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          color: Colors.white.withAlpha(178),
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      const SizedBox(height: 40),

                      // Login card
                      Container(
                        padding: const EdgeInsets.all(28),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withAlpha(38),
                              blurRadius: 30,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Text(
                                'Connexion',
                                style: GoogleFonts.inter(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 24),

                              // Email field
                              TextFormField(
                                controller: _emailController,
                                keyboardType: TextInputType.emailAddress,
                                textInputAction: TextInputAction.next,
                                decoration: InputDecoration(
                                  prefixIcon: const Icon(
                                    Icons.email_outlined,
                                    color: AppColors.textSecondary,
                                    size: 20,
                                  ),
                                  hintText: 'Email',
                                  labelText: 'Email',
                                  floatingLabelBehavior:
                                      FloatingLabelBehavior.never,
                                ),
                                validator: (v) {
                                  if (v == null || v.trim().isEmpty) {
                                    return 'Veuillez entrer votre email';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 16),

                              // Password field
                              TextFormField(
                                controller: _passwordController,
                                obscureText: _obscurePassword,
                                textInputAction: TextInputAction.done,
                                onFieldSubmitted: (_) => _handleLogin(),
                                decoration: InputDecoration(
                                  prefixIcon: const Icon(
                                    Icons.lock_outlined,
                                    color: AppColors.textSecondary,
                                    size: 20,
                                  ),
                                  hintText: 'Mot de passe',
                                  labelText: 'Mot de passe',
                                  floatingLabelBehavior:
                                      FloatingLabelBehavior.never,
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _obscurePassword
                                          ? Icons.visibility_off_outlined
                                          : Icons.visibility_outlined,
                                      color: AppColors.textSecondary,
                                      size: 20,
                                    ),
                                    onPressed: () {
                                      setState(() {
                                        _obscurePassword = !_obscurePassword;
                                      });
                                    },
                                  ),
                                ),
                                validator: (v) {
                                  if (v == null || v.isEmpty) {
                                    return 'Veuillez entrer votre mot de passe';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 8),

                              // Error message
                              if (_errorMessage != null)
                                Padding(
                                  padding:
                                      const EdgeInsets.only(top: 8, bottom: 4),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 10),
                                    decoration: BoxDecoration(
                                      color: AppColors.error.withAlpha(25),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(
                                          Icons.error_outline,
                                          color: AppColors.error,
                                          size: 18,
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            _errorMessage!,
                                            style: GoogleFonts.inter(
                                              color: AppColors.error,
                                              fontSize: 13,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),

                              const SizedBox(height: 20),

                              // Login button
                              SizedBox(
                                height: 52,
                                child: ElevatedButton(
                                  onPressed: _isLoading ? null : _handleLogin,
                                  child: _isLoading
                                      ? const SizedBox(
                                          width: 22,
                                          height: 22,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2.5,
                                            color: Colors.white,
                                          ),
                                        )
                                      : Text(
                                          'Se connecter',
                                          style: GoogleFonts.inter(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 16,
                                          ),
                                        ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 30),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
