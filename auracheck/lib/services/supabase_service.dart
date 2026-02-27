import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/spot.dart';
import '../models/skin_check.dart';

class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;

  Future<List<SkinSpot>> fetchSpots() async {
    final response = await client
        .from('skin_spots')
        .select('*, spot_photos(*)')
        .order('created_at', ascending: false);
    return (response as List).map((json) => SkinSpot.fromJson(json)).toList();
  }

  Future<SkinSpot> createSpot(Map<String, dynamic> data) async {
    final response = await client.from('skin_spots').insert(data).select().single();
    return SkinSpot.fromJson(response);
  }

  Future<SkinSpot> updateSpot(String id, Map<String, dynamic> data) async {
    final response = await client.from('skin_spots').update(data).eq('id', id).select().single();
    return SkinSpot.fromJson(response);
  }

  Future<String> uploadSpotPhoto(String spotId, File file) async {
    final fileName = '${spotId}_${DateTime.now().millisecondsSinceEpoch}.jpg';
    final path = 'spot-photos/$fileName';
    await client.storage.from('skin-photos').upload(path, file);
    final url = client.storage.from('skin-photos').getPublicUrl(path);
    return url;
  }

  Future<SpotPhoto> createSpotPhoto(Map<String, dynamic> data) async {
    final response = await client.from('spot_photos').insert(data).select().single();
    return SpotPhoto.fromJson(response);
  }

  Future<List<SkinCheck>> fetchCheckHistory({int limit = 30}) async {
    final response = await client
        .from('skin_checks')
        .select('*')
        .order('date', ascending: false)
        .limit(limit);
    return (response as List).map((json) => SkinCheck.fromJson(json)).toList();
  }

  Future<SkinCheck> createCheck(Map<String, dynamic> data) async {
    final response = await client.from('skin_checks').insert(data).select().single();
    return SkinCheck.fromJson(response);
  }

  User? get currentUser => client.auth.currentUser;
  bool get isLoggedIn => currentUser != null;
}

final supabaseService = SupabaseService();
