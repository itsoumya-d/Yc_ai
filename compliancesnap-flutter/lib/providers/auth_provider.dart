import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/supabase_service.dart';

class AuthNotifier extends Notifier<User?> {
  @override
  User? build() {
    return Supabase.instance.client.auth.currentUser;
  }

  Future<bool> signIn(String email, String password) async {
    final success = await SupabaseService.signIn(email, password);
    if (success) {
      state = Supabase.instance.client.auth.currentUser;
    }
    return success;
  }

  Future<void> signOut() async {
    await SupabaseService.signOut();
    state = null;
  }

  bool get isAuthenticated => state != null;
}

final authProvider = NotifierProvider<AuthNotifier, User?>(AuthNotifier.new);

final isAuthenticatedProvider = Provider<bool>((ref) {
  // For demo purposes allow all users through
  return true;
});
