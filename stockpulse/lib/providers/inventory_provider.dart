import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/product.dart';
import '../models/inventory_movement.dart';
import '../models/purchase_order.dart';

// --- State Classes ---

class InventoryState {
  final List<Product> products;
  final List<InventoryMovement> movements;
  final List<PurchaseOrder> orders;
  final bool isLoading;
  final String? error;
  final String searchQuery;
  final String? selectedCategory;
  final SortOption sortOption;

  const InventoryState({
    this.products = const [],
    this.movements = const [],
    this.orders = const [],
    this.isLoading = false,
    this.error,
    this.searchQuery = '',
    this.selectedCategory,
    this.sortOption = SortOption.nameAsc,
  });

  List<Product> get filteredProducts {
    var result = products.where((p) {
      final matchesSearch = searchQuery.isEmpty ||
          p.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().contains(searchQuery.toLowerCase()) ||
          (p.barcode?.contains(searchQuery) ?? false);
      final matchesCategory = selectedCategory == null || p.category == selectedCategory;
      return matchesSearch && matchesCategory;
    }).toList();

    switch (sortOption) {
      case SortOption.nameAsc:
        result.sort((a, b) => a.name.compareTo(b.name));
        break;
      case SortOption.nameDesc:
        result.sort((a, b) => b.name.compareTo(a.name));
        break;
      case SortOption.quantityAsc:
        result.sort((a, b) => a.quantity.compareTo(b.quantity));
        break;
      case SortOption.quantityDesc:
        result.sort((a, b) => b.quantity.compareTo(a.quantity));
        break;
      case SortOption.valueAsc:
        result.sort((a, b) => a.totalValue.compareTo(b.totalValue));
        break;
      case SortOption.valueDesc:
        result.sort((a, b) => b.totalValue.compareTo(a.totalValue));
        break;
    }
    return result;
  }

  List<Product> get lowStockProducts => products.where((p) => p.isLowStock).toList();
  List<Product> get outOfStockProducts => products.where((p) => p.isOutOfStock).toList();
  double get totalInventoryValue => products.fold(0.0, (sum, p) => sum + p.totalValue);
  int get totalSkus => products.length;
  List<String> get categories => products.map((p) => p.category).toSet().toList()..sort();

  InventoryState copyWith({
    List<Product>? products,
    List<InventoryMovement>? movements,
    List<PurchaseOrder>? orders,
    bool? isLoading,
    String? error,
    String? searchQuery,
    String? selectedCategory,
    SortOption? sortOption,
    bool clearError = false,
    bool clearCategory = false,
  }) {
    return InventoryState(
      products: products ?? this.products,
      movements: movements ?? this.movements,
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
      searchQuery: searchQuery ?? this.searchQuery,
      selectedCategory: clearCategory ? null : (selectedCategory ?? this.selectedCategory),
      sortOption: sortOption ?? this.sortOption,
    );
  }
}

enum SortOption { nameAsc, nameDesc, quantityAsc, quantityDesc, valueAsc, valueDesc }

extension SortOptionExtension on SortOption {
  String get displayName {
    switch (this) {
      case SortOption.nameAsc: return 'Name A-Z';
      case SortOption.nameDesc: return 'Name Z-A';
      case SortOption.quantityAsc: return 'Quantity Low-High';
      case SortOption.quantityDesc: return 'Quantity High-Low';
      case SortOption.valueAsc: return 'Value Low-High';
      case SortOption.valueDesc: return 'Value High-Low';
    }
  }
}

// --- Notifier ---

class InventoryNotifier extends StateNotifier<InventoryState> {
  InventoryNotifier() : super(const InventoryState()) {
    _loadData();
  }

  Future<void> _loadData() async {
    state = state.copyWith(isLoading: true, clearError: true);
    await Future.delayed(const Duration(milliseconds: 600));
    state = state.copyWith(
      products: Product.sampleData(),
      movements: InventoryMovement.sampleData(),
      orders: PurchaseOrder.sampleData(),
      isLoading: false,
    );
  }

  Future<void> refresh() => _loadData();

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  void setCategory(String? category) {
    if (category == null) {
      state = state.copyWith(clearCategory: true);
    } else {
      state = state.copyWith(selectedCategory: category);
    }
  }

  void setSortOption(SortOption option) {
    state = state.copyWith(sortOption: option);
  }

  Future<void> adjustQuantity(String productId, int delta, String? note) async {
    final idx = state.products.indexWhere((p) => p.id == productId);
    if (idx == -1) return;
    final product = state.products[idx];
    final newQty = (product.quantity + delta).clamp(0, 999999);
    final updatedProducts = [...state.products];
    updatedProducts[idx] = product.copyWith(quantity: newQty, updatedAt: DateTime.now());
    final movement = InventoryMovement(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      productId: productId,
      type: delta > 0 ? MovementType.received : MovementType.sold,
      quantity: delta.abs(),
      note: note,
      createdAt: DateTime.now(),
      productName: product.name,
    );
    state = state.copyWith(
      products: updatedProducts,
      movements: [movement, ...state.movements],
    );
  }

  Future<void> addProduct(Product product) async {
    state = state.copyWith(products: [...state.products, product]);
  }

  Future<void> updateProduct(Product product) async {
    final updatedProducts = state.products.map((p) => p.id == product.id ? product : p).toList();
    state = state.copyWith(products: updatedProducts);
  }

  Future<void> deleteProduct(String productId) async {
    final updatedProducts = state.products.where((p) => p.id != productId).toList();
    state = state.copyWith(products: updatedProducts);
  }

  Product? findByBarcode(String barcode) {
    try {
      return state.products.firstWhere((p) => p.barcode == barcode);
    } catch (_) {
      return null;
    }
  }

  Future<void> createPurchaseOrder(PurchaseOrder order) async {
    state = state.copyWith(orders: [order, ...state.orders]);
  }
}

// --- Providers ---

final inventoryProvider = StateNotifierProvider<InventoryNotifier, InventoryState>((ref) {
  return InventoryNotifier();
});

final lowStockProductsProvider = Provider<List<Product>>((ref) {
  return ref.watch(inventoryProvider).lowStockProducts;
});

final totalInventoryValueProvider = Provider<double>((ref) {
  return ref.watch(inventoryProvider).totalInventoryValue;
});

final filteredProductsProvider = Provider<List<Product>>((ref) {
  return ref.watch(inventoryProvider).filteredProducts;
});
