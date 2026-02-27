class Product {
  final String id;
  final String name;
  final String sku;
  final String? barcode;
  final String category;
  final int quantity;
  final int minQuantity;
  final double unitPrice;
  final String? location;
  final String? supplier;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Product({
    required this.id,
    required this.name,
    required this.sku,
    this.barcode,
    required this.category,
    required this.quantity,
    required this.minQuantity,
    required this.unitPrice,
    this.location,
    this.supplier,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isLowStock => quantity <= minQuantity;
  bool get isOutOfStock => quantity == 0;
  double get totalValue => quantity * unitPrice;

  StockStatus get stockStatus {
    if (quantity == 0) return StockStatus.outOfStock;
    if (quantity <= minQuantity) return StockStatus.low;
    if (quantity <= minQuantity * 1.5) return StockStatus.medium;
    return StockStatus.good;
  }

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      name: json['name'] as String,
      sku: json['sku'] as String,
      barcode: json['barcode'] as String?,
      category: json['category'] as String? ?? 'Uncategorized',
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      minQuantity: (json['min_quantity'] as num?)?.toInt() ?? 0,
      unitPrice: (json['unit_price'] as num?)?.toDouble() ?? 0.0,
      location: json['location'] as String?,
      supplier: json['supplier'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'sku': sku,
      'barcode': barcode,
      'category': category,
      'quantity': quantity,
      'min_quantity': minQuantity,
      'unit_price': unitPrice,
      'location': location,
      'supplier': supplier,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Product copyWith({
    String? id,
    String? name,
    String? sku,
    String? barcode,
    String? category,
    int? quantity,
    int? minQuantity,
    double? unitPrice,
    String? location,
    String? supplier,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      sku: sku ?? this.sku,
      barcode: barcode ?? this.barcode,
      category: category ?? this.category,
      quantity: quantity ?? this.quantity,
      minQuantity: minQuantity ?? this.minQuantity,
      unitPrice: unitPrice ?? this.unitPrice,
      location: location ?? this.location,
      supplier: supplier ?? this.supplier,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  static List<Product> sampleData() {
    final now = DateTime.now();
    return [
      Product(id: '1', name: 'Widget Pro X', sku: 'WPX-001', barcode: '1234567890', category: 'Electronics', quantity: 45, minQuantity: 10, unitPrice: 29.99, location: 'Shelf A1', supplier: 'TechCorp', createdAt: now, updatedAt: now),
      Product(id: '2', name: 'Bolt Set M8', sku: 'BSM8-042', barcode: '2345678901', category: 'Hardware', quantity: 5, minQuantity: 20, unitPrice: 4.99, location: 'Bin B3', supplier: 'FastenWorld', createdAt: now, updatedAt: now),
      Product(id: '3', name: 'Safety Gloves L', sku: 'SGL-003', barcode: '3456789012', category: 'Safety', quantity: 0, minQuantity: 5, unitPrice: 12.50, location: 'Cabinet C', supplier: 'SafetyFirst', createdAt: now, updatedAt: now),
      Product(id: '4', name: 'Cable Tie 300mm', sku: 'CT300-004', barcode: '4567890123', category: 'Electrical', quantity: 200, minQuantity: 50, unitPrice: 0.25, location: 'Drawer D2', supplier: 'ElecSup', createdAt: now, updatedAt: now),
      Product(id: '5', name: 'Bearing 6204', sku: 'B6204-005', barcode: '5678901234', category: 'Mechanical', quantity: 8, minQuantity: 15, unitPrice: 18.75, location: 'Shelf E4', supplier: 'BearCo', createdAt: now, updatedAt: now),
    ];
  }
}

enum StockStatus { outOfStock, low, medium, good }
