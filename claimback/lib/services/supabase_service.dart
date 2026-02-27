import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/claim.dart';

class SupabaseService {
  final SupabaseClient _client;

  SupabaseService(this._client);

  Future<List<Map<String, dynamic>>> getClaims(String userId) async {
    try {
      final response = await _client
          .from('claims')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (e) {
      return [];
    }
  }

  Future<String?> createClaim(Map<String, dynamic> data) async {
    try {
      final response = await _client
          .from('claims')
          .insert(data)
          .select('id')
          .single();
      return response['id'] as String?;
    } catch (e) {
      return null;
    }
  }

  Future<bool> updateClaim(String claimId, Map<String, dynamic> data) async {
    try {
      await _client.from('claims').update(data).eq('id', claimId);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteClaim(String claimId) async {
    try {
      await _client.from('claims').delete().eq('id', claimId);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<String?> uploadEvidence(String userId, String claimId, String fileName, List<int> bytes) async {
    try {
      final path = '$userId/$claimId/$fileName';
      await _client.storage.from('evidence').uploadBinary(path, bytes);
      return _client.storage.from('evidence').getPublicUrl(path);
    } catch (e) {
      return null;
    }
  }
}
