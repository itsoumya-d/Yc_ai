import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

final currentUserProvider = Provider<User?>((ref) {
  return Supabase.instance.client.auth.currentUser;
});

class AuthNotifier extends StateNotifier<AsyncValue<User?>> {
  final SupabaseClient _client;

  AuthNotifier(this._client) : super(const AsyncValue.loading()) {
    _init();
  }

  void _init() {
    final user = _client.auth.currentUser;
    state = AsyncValue.data(user);
    _client.auth.onAuthStateChange.listen((event) {
      state = AsyncValue.data(event.session?.user);
    });
  }

  Future<void> signIn(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final response = await _client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      state = AsyncValue.data(response.user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signUp(String email, String password, String name) async {
    state = const AsyncValue.loading();
    try {
      final response = await _client.auth.signUp(
        email: email,
        password: password,
        data: {'full_name': name},
      );
      state = AsyncValue.data(response.user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
    state = const AsyncValue.data(null);
  }
}

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AsyncValue<User?>>((ref) {
  final client = ref.watch(supabaseClientProvider);
  return AuthNotifier(client);
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  final authState = ref.watch(authNotifierProvider);
  return authState.maybeWhen(
    data: (user) => user != null,
    orElse: () => false,
  );
});
