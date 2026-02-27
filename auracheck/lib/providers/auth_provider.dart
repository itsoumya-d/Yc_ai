import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isLoggedIn => user != null;

  AuthState copyWith({User? user, bool? isLoading, String? error, bool clearError = false, bool clearUser = false}) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _init();
  }

  void _init() {
    final currentUser = Supabase.instance.client.auth.currentUser;
    state = state.copyWith(user: currentUser);
    Supabase.instance.client.auth.onAuthStateChange.listen((data) {
      state = state.copyWith(user: data.session?.user, clearUser: data.session == null);
    });
  }

  Future<void> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      await Supabase.instance.client.auth.signInWithPassword(email: email, password: password);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> signOut() async {
    await Supabase.instance.client.auth.signOut();
    state = state.copyWith(clearUser: true);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier());
