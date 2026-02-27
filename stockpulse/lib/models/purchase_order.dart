class PurchaseOrder {
  final String id;
  final String supplier;
  final List<OrderItem> items;
  final OrderStatus status;
  final double total;
  final DateTime orderedAt;
  final DateTime? receivedAt;
  final String? notes;

  const PurchaseOrder({
    required this.id,
    required this.supplier,
    required this.items,
    required this.status,
    required this.total,
    required this.orderedAt,
    this.receivedAt,
    this.notes,
  });

  int get totalItems => items.fold(0, (sum, item) => sum + item.quantity);

  factory PurchaseOrder.fromJson(Map<String, dynamic> json) {
    final itemsData = json['items'] as List<dynamic>? ?? [];
    return PurchaseOrder(
      id: json['id'] as String,
      supplier: json['supplier'] as String,
      items: itemsData.map((item) => OrderItem.fromJson(item as Map<String, dynamic>)).toList(),
      status: OrderStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => OrderStatus.pending,
      ),
      total: (json['total'] as num).toDouble(),
      orderedAt: DateTime.parse(json['ordered_at'] as String),
      receivedAt: json['received_at'] != null ? DateTime.parse(json['received_at'] as String) : null,
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'supplier': supplier,
      'items': items.map((i) => i.toJson()).toList(),
      'status': status.name,
      'total': total,
      'ordered_at': orderedAt.toIso8601String(),
      'received_at': receivedAt?.toIso8601String(),
      'notes': notes,
    };
  }

  static List<PurchaseOrder> sampleData() {
    final now = DateTime.now();
    return [
      PurchaseOrder(
        id: 'po1',
        supplier: 'TechCorp',
        status: OrderStatus.delivered,
        total: 1499.50,
        orderedAt: now.subtract(const Duration(days: 7)),
        receivedAt: now.subtract(const Duration(days: 2)),
        items: [
          OrderItem(productId: '1', productName: 'Widget Pro X', sku: 'WPX-001', quantity: 50, unitPrice: 29.99),
        ],
      ),
      PurchaseOrder(
        id: 'po2',
        supplier: 'FastenWorld',
        status: OrderStatus.ordered,
        total: 249.50,
        orderedAt: now.subtract(const Duration(days: 1)),
        items: [
          OrderItem(productId: '2', productName: 'Bolt Set M8', sku: 'BSM8-042', quantity: 50, unitPrice: 4.99),
        ],
      ),
      PurchaseOrder(
        id: 'po3',
        supplier: 'SafetyFirst',
        status: OrderStatus.pending,
        total: 62.50,
        orderedAt: now,
        items: [
          OrderItem(productId: '3', productName: 'Safety Gloves L', sku: 'SGL-003', quantity: 5, unitPrice: 12.50),
        ],
      ),
    ];
  }
}

class OrderItem {
  final String productId;
  final String productName;
  final String sku;
  final int quantity;
  final double unitPrice;

  const OrderItem({
    required this.productId,
    required this.productName,
    required this.sku,
    required this.quantity,
    required this.unitPrice,
  });

  double get lineTotal => quantity * unitPrice;

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['product_id'] as String,
      productName: json['product_name'] as String,
      sku: json['sku'] as String,
      quantity: (json['quantity'] as num).toInt(),
      unitPrice: (json['unit_price'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'product_name': productName,
      'sku': sku,
      'quantity': quantity,
      'unit_price': unitPrice,
    };
  }
}

enum OrderStatus {
  draft,
  pending,
  ordered,
  shipped,
  delivered,
  cancelled,
}

extension OrderStatusExtension on OrderStatus {
  String get displayName {
    switch (this) {
      case OrderStatus.draft: return 'Draft';
      case OrderStatus.pending: return 'Pending Approval';
      case OrderStatus.ordered: return 'Ordered';
      case OrderStatus.shipped: return 'Shipped';
      case OrderStatus.delivered: return 'Delivered';
      case OrderStatus.cancelled: return 'Cancelled';
    }
  }

  int get colorValue {
    switch (this) {
      case OrderStatus.draft: return 0xFF9CA3AF;
      case OrderStatus.pending: return 0xFFF59E0B;
      case OrderStatus.ordered: return 0xFF3B82F6;
      case OrderStatus.shipped: return 0xFF8B5CF6;
      case OrderStatus.delivered: return 0xFF059669;
      case OrderStatus.cancelled: return 0xFFEF4444;
    }
  }
}
