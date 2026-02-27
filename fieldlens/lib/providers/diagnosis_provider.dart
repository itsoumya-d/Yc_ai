import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/diagnosis.dart';
import '../services/ai_diagnosis_service.dart';

class DiagnosisState {
  final List<Diagnosis> history;
  final Diagnosis? current;
  final bool isAnalyzing;
  final String? error;
  final String selectedTrade;

  const DiagnosisState({
    this.history = const [],
    this.current,
    this.isAnalyzing = false,
    this.error,
    this.selectedTrade = 'plumbing',
  });

  DiagnosisState copyWith({
    List<Diagnosis>? history,
    Diagnosis? current,
    bool? isAnalyzing,
    String? error,
    String? selectedTrade,
    bool clearError = false,
    bool clearCurrent = false,
  }) {
    return DiagnosisState(
      history: history ?? this.history,
      current: clearCurrent ? null : (current ?? this.current),
      isAnalyzing: isAnalyzing ?? this.isAnalyzing,
      error: clearError ? null : (error ?? this.error),
      selectedTrade: selectedTrade ?? this.selectedTrade,
    );
  }
}

class DiagnosisNotifier extends StateNotifier<DiagnosisState> {
  final AiDiagnosisService _service;

  DiagnosisNotifier(this._service) : super(const DiagnosisState()) {
    _loadHistory();
  }

  void _loadHistory() {
    state = state.copyWith(history: [Diagnosis.samplePlumbing()]);
  }

  void setTrade(String trade) {
    state = state.copyWith(selectedTrade: trade);
  }

  Future<Diagnosis?> analyzeProblem({
    File? imageFile,
    required String description,
    required String trade,
  }) async {
    state = state.copyWith(isAnalyzing: true, clearError: true);
    try {
      final diagnosis = await _service.analyze(
        imageFile: imageFile,
        description: description,
        trade: trade,
      );
      state = state.copyWith(
        current: diagnosis,
        history: [diagnosis, ...state.history],
        isAnalyzing: false,
      );
      return diagnosis;
    } catch (e) {
      state = state.copyWith(isAnalyzing: false, error: e.toString());
      return null;
    }
  }

  void clearCurrent() {
    state = state.copyWith(clearCurrent: true);
  }
}

final diagnosisServiceProvider = Provider<AiDiagnosisService>((ref) {
  return AiDiagnosisService();
});

final diagnosisProvider = StateNotifierProvider<DiagnosisNotifier, DiagnosisState>((ref) {
  return DiagnosisNotifier(ref.watch(diagnosisServiceProvider));
});
