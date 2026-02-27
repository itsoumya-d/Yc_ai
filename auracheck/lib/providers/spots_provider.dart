import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/spot.dart';
import '../models/skin_check.dart';
import '../services/ai_analysis_service.dart';

class SpotsState {
  final List<SkinSpot> spots;
  final List<SkinCheck> checkHistory;
  final bool isLoading;
  final String? error;
  final RiskLevel? filterRisk;
  final int checkStreak;
  final double overallHealthScore;

  const SpotsState({
    this.spots = const [],
    this.checkHistory = const [],
    this.isLoading = false,
    this.error,
    this.filterRisk,
    this.checkStreak = 0,
    this.overallHealthScore = 0.0,
  });

  List<SkinSpot> get filteredSpots {
    if (filterRisk == null) return spots;
    return spots.where((s) => s.aiRiskLevel == filterRisk).toList();
  }

  List<SkinSpot> get highRiskSpots => spots.where((s) => s.aiRiskLevel == RiskLevel.high || s.aiRiskLevel == RiskLevel.urgent).toList();
  List<SkinSpot> get changedSpots => spots.where((s) => s.photos.any((p) => p.changeDetected)).toList();
  bool get hasTodayCheck => checkHistory.isNotEmpty && _isToday(checkHistory.first.date);

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }

  double _calculateHealthScore() {
    if (spots.isEmpty) return 100.0;
    double score = 100.0;
    for (final spot in spots) {
      switch (spot.aiRiskLevel) {
        case RiskLevel.low: score -= 0;
        case RiskLevel.moderate: score -= 10;
        case RiskLevel.high: score -= 25;
        case RiskLevel.urgent: score -= 40;
      }
    }
    return score.clamp(0, 100);
  }

  SpotsState copyWith({
    List<SkinSpot>? spots,
    List<SkinCheck>? checkHistory,
    bool? isLoading,
    String? error,
    RiskLevel? filterRisk,
    int? checkStreak,
    double? overallHealthScore,
    bool clearFilter = false,
  }) {
    return SpotsState(
      spots: spots ?? this.spots,
      checkHistory: checkHistory ?? this.checkHistory,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      filterRisk: clearFilter ? null : (filterRisk ?? this.filterRisk),
      checkStreak: checkStreak ?? this.checkStreak,
      overallHealthScore: overallHealthScore ?? this.overallHealthScore,
    );
  }
}

class SpotsNotifier extends StateNotifier<SpotsState> {
  final AiAnalysisService _service;

  SpotsNotifier(this._service) : super(const SpotsState()) {
    _load();
  }

  void _load() {
    state = state.copyWith(isLoading: true);
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        final spots = SkinSpot.sampleData();
        final checks = SkinCheck.sampleData();
        final streak = _calculateStreak(checks);
        state = state.copyWith(
          spots: spots,
          checkHistory: checks,
          checkStreak: streak,
          overallHealthScore: _calculateScore(spots),
          isLoading: false,
        );
      }
    });
  }

  int _calculateStreak(List<SkinCheck> checks) {
    if (checks.isEmpty) return 0;
    int streak = 0;
    DateTime expected = DateTime.now();
    for (final check in checks.reversed.toList().reversed) {
      final diff = expected.difference(check.date).inDays.abs();
      if (diff <= 1) {
        streak++;
        expected = check.date.subtract(const Duration(days: 1));
      } else {
        break;
      }
    }
    return streak;
  }

  double _calculateScore(List<SkinSpot> spots) {
    if (spots.isEmpty) return 100.0;
    double score = 100.0;
    for (final s in spots) {
      switch (s.aiRiskLevel) {
        case RiskLevel.low: break;
        case RiskLevel.moderate: score -= 10;
        case RiskLevel.high: score -= 25;
        case RiskLevel.urgent: score -= 40;
      }
    }
    return score.clamp(0, 100);
  }

  Future<void> refresh() => Future(() => _load());

  void setFilter(RiskLevel? risk) {
    if (risk == null) {
      state = state.copyWith(clearFilter: true);
    } else {
      state = state.copyWith(filterRisk: risk);
    }
  }

  Future<SkinSpot?> addSpot({
    required String name,
    required String locationOnBody,
    String? notes,
    File? photo,
  }) async {
    final spot = SkinSpot(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      locationOnBody: locationOnBody,
      firstDetected: DateTime.now(),
      aiRiskLevel: RiskLevel.low,
      notes: notes,
      photos: [],
    );

    state = state.copyWith(spots: [...state.spots, spot]);

    if (photo != null) {
      await analyzeSpotPhoto(spot.id, photo);
    }

    return spot;
  }

  Future<void> analyzeSpotPhoto(String spotId, File photo) async {
    try {
      final analysis = await _service.analyzeSpot(photo);
      final updatedSpots = state.spots.map((s) {
        if (s.id != spotId) return s;
        final newPhoto = SpotPhoto(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          spotId: spotId,
          localPath: photo.path,
          takenAt: DateTime.now(),
          aiAnalysis: analysis.analysis,
          changeDetected: analysis.changeDetected,
        );
        return s.copyWith(
          aiRiskLevel: analysis.riskLevel,
          photos: [newPhoto, ...s.photos],
        );
      }).toList();
      state = state.copyWith(spots: updatedSpots);
    } catch (e) {
      state = state.copyWith(error: 'Photo analysis failed: $e');
    }
  }

  Future<SkinCheck> completeCheck({
    required List<String> areasChecked,
    required int newSpotsFound,
    String? notes,
  }) async {
    final check = SkinCheck(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      date: DateTime.now(),
      spotsChecked: state.spots.length,
      newSpotsFound: newSpotsFound,
      notes: notes,
      completed: true,
      areasChecked: areasChecked,
    );
    final newHistory = [check, ...state.checkHistory];
    state = state.copyWith(
      checkHistory: newHistory,
      checkStreak: _calculateStreak(newHistory),
    );
    return check;
  }

  SkinSpot? findById(String id) {
    try {
      return state.spots.firstWhere((s) => s.id == id);
    } catch (_) {
      return null;
    }
  }
}

final aiServiceProvider = Provider<AiAnalysisService>((ref) => AiAnalysisService());

final spotsProvider = StateNotifierProvider<SpotsNotifier, SpotsState>((ref) {
  return SpotsNotifier(ref.watch(aiServiceProvider));
});
