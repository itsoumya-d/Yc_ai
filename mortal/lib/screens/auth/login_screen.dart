import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;
  bool _isSignUp = false;
  final _nameController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      if (_isSignUp) {
        await ref.read(authNotifierProvider.notifier).signUp(
          _emailController.text.trim(),
          _passwordController.text,
          _nameController.text.trim(),
        );
      } else {
        await ref.read(authNotifierProvider.notifier).signIn(
          _emailController.text.trim(),
          _passwordController.text,
        );
      }
      if (mounted) context.go('/home');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: AppTheme.errorRed),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 40),
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppTheme.primaryTeal,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.spa_outlined, size: 40, color: Colors.white),
              ),
              const SizedBox(height: 20),
              const Text(
                'Mortal',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.darkTeal,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Plan thoughtfully. Leave nothing unsaid.',
                style: TextStyle(color: AppTheme.warmBrown, fontSize: 14),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE7E5E4)),
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _isSignUp ? 'Create Account' : 'Welcome Back',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.darkTeal,
                        ),
                      ),
                      const SizedBox(height: 20),
                      if (_isSignUp) ...[
                        TextFormField(
                          controller: _nameController,
                          decoration: const InputDecoration(
                            labelText: 'Full Name',
                            prefixIcon: Icon(Icons.person_outlined),
                          ),
                          validator: (v) => v?.isEmpty == true ? 'Required' : null,
                        ),
                        const SizedBox(height: 16),
                      ],
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          labelText: 'Email',
                          prefixIcon: Icon(Icons.email_outlined),
                        ),
                        validator: (v) {
                          if (v?.isEmpty == true) return 'Required';
                          if (v?.contains('@') == false) return 'Invalid email';
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          prefixIcon: const Icon(Icons.lock_outlined),
                          suffixIcon: IconButton(
                            icon: Icon(_obscurePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined),
                            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                          ),
                        ),
                        validator: (v) {
                          if (v?.isEmpty == true) return 'Required';
                          if (_isSignUp && (v?.length ?? 0) < 6) return 'Min 6 characters';
                          return null;
                        },
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: _isLoading ? null : _submit,
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : Text(_isSignUp ? 'Create Account' : 'Sign In'),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(_isSignUp ? 'Already have an account? ' : "Don't have an account? "),
                          TextButton(
                            onPressed: () => setState(() => _isSignUp = !_isSignUp),
                            child: Text(_isSignUp ? 'Sign In' : 'Sign Up'),
                          ),
                        ],
                      ),
                      Center(
                        child: TextButton(
                          onPressed: () => context.go('/home'),
                          child: const Text('Continue without account'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Your data is encrypted and secure.\nOnly you can access your plans.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: AppTheme.warmBrown),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
