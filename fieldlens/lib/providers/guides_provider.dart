import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/guide.dart';

class GuidesState {
  final List<Guide> guides;
  final bool isLoading;
  final String? error;
  final String? selectedTrade;
  final GuideDifficulty? selectedDifficulty;
  final String searchQuery;

  const GuidesState({
    this.guides = const [],
    this.isLoading = false,
    this.error,
    this.selectedTrade,
    this.selectedDifficulty,
    this.searchQuery = '',
  });

  List<Guide> get filteredGuides {
    return guides.where((g) {
      final matchesTrade = selectedTrade == null || g.trade == selectedTrade;
      final matchesDifficulty = selectedDifficulty == null || g.difficulty == selectedDifficulty;
      final matchesSearch = searchQuery.isEmpty ||
          g.title.toLowerCase().contains(searchQuery.toLowerCase()) ||
          g.trade.toLowerCase().contains(searchQuery.toLowerCase());
      return matchesTrade && matchesDifficulty && matchesSearch;
    }).toList();
  }

  GuidesState copyWith({
    List<Guide>? guides,
    bool? isLoading,
    String? error,
    String? selectedTrade,
    GuideDifficulty? selectedDifficulty,
    String? searchQuery,
    bool clearTrade = false,
    bool clearDifficulty = false,
  }) {
    return GuidesState(
      guides: guides ?? this.guides,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      selectedTrade: clearTrade ? null : (selectedTrade ?? this.selectedTrade),
      selectedDifficulty: clearDifficulty ? null : (selectedDifficulty ?? this.selectedDifficulty),
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class GuidesNotifier extends StateNotifier<GuidesState> {
  GuidesNotifier() : super(const GuidesState()) {
    _load();
  }

  void _load() {
    state = state.copyWith(isLoading: true);
    Future.delayed(const Duration(milliseconds: 400), () {
      if (mounted) {
        state = state.copyWith(guides: Guide.sampleData(), isLoading: false);
      }
    });
  }

  void setTrade(String? trade) {
    if (trade == null) {
      state = state.copyWith(clearTrade: true);
    } else {
      state = state.copyWith(selectedTrade: trade);
    }
  }

  void setDifficulty(GuideDifficulty? difficulty) {
    if (difficulty == null) {
      state = state.copyWith(clearDifficulty: true);
    } else {
      state = state.copyWith(selectedDifficulty: difficulty);
    }
  }

  void setSearch(String query) {
    state = state.copyWith(searchQuery: query);
  }

  Guide? findById(String id) {
    try {
      return state.guides.firstWhere((g) => g.id == id);
    } catch (_) {
      return null;
    }
  }
}

final guidesProvider = StateNotifierProvider<GuidesNotifier, GuidesState>((ref) {
  return GuidesNotifier();
});
