class InventoryMovement {
  final String id;
  final String productId;
  final MovementType type;
  final int quantity;
  final String? note;
  final DateTime createdAt;
  final String? productName;

  const InventoryMovement({
    required this.id,
    required this.productId,
    required this.type,
    required this.quantity,
    this.note,
    required this.createdAt,
    this.productName,
  });

  bool get isPositive => type == MovementType.received || type == MovementType.adjustment && quantity > 0 || type == MovementType.returned;
  int get signedQuantity => isPositive ? quantity.abs() : -quantity.abs();

  factory InventoryMovement.fromJson(Map<String, dynamic> json) {
    return InventoryMovement(
      id: json['id'] as String,
      productId: json['product_id'] as String,
      type: MovementType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => MovementType.adjustment,
      ),
      quantity: (json['quantity'] as num).toInt(),
      note: json['note'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      productName: json['product_name'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_id': productId,
      'type': type.name,
      'quantity': quantity,
      'note': note,
      'created_at': createdAt.toIso8601String(),
    };
  }

  static List<InventoryMovement> sampleData() {
    final now = DateTime.now();
    return [
      InventoryMovement(id: 'm1', productId: '1', type: MovementType.received, quantity: 50, note: 'Purchase Order #PO-001', createdAt: now.subtract(const Duration(hours: 2)), productName: 'Widget Pro X'),
      InventoryMovement(id: 'm2', productId: '2', type: MovementType.sold, quantity: 15, note: 'Sales Order #SO-042', createdAt: now.subtract(const Duration(hours: 5)), productName: 'Bolt Set M8'),
      InventoryMovement(id: 'm3', productId: '3', type: MovementType.adjustment, quantity: -3, note: 'Damaged goods removed', createdAt: now.subtract(const Duration(days: 1)), productName: 'Safety Gloves L'),
      InventoryMovement(id: 'm4', productId: '4', type: MovementType.received, quantity: 100, note: 'Restocking', createdAt: now.subtract(const Duration(days: 1, hours: 3)), productName: 'Cable Tie 300mm'),
      InventoryMovement(id: 'm5', productId: '5', type: MovementType.sold, quantity: 7, note: 'Customer order', createdAt: now.subtract(const Duration(days: 2)), productName: 'Bearing 6204'),
    ];
  }
}

enum MovementType {
  received,
  sold,
  adjustment,
  returned,
  transferred,
  damaged,
}

extension MovementTypeExtension on MovementType {
  String get displayName {
    switch (this) {
      case MovementType.received: return 'Received';
      case MovementType.sold: return 'Sold';
      case MovementType.adjustment: return 'Adjustment';
      case MovementType.returned: return 'Returned';
      case MovementType.transferred: return 'Transferred';
      case MovementType.damaged: return 'Damaged';
    }
  }

  bool get isInbound {
    return this == MovementType.received || this == MovementType.returned;
  }
}
