enum WillItemType {
  property,
  financial,
  personalItems,
  pets,
  other,
}

extension WillItemTypeExtension on WillItemType {
  String get label {
    switch (this) {
      case WillItemType.property:
        return 'Property';
      case WillItemType.financial:
        return 'Financial';
      case WillItemType.personalItems:
        return 'Personal Items';
      case WillItemType.pets:
        return 'Pets';
      case WillItemType.other:
        return 'Other';
    }
  }
}

class WillItem {
  final String id;
  final WillItemType type;
  final String description;
  final String beneficiary;
  final double? estimatedValue;
  final String? documentUrl;

  const WillItem({
    required this.id,
    required this.type,
    required this.description,
    required this.beneficiary,
    this.estimatedValue,
    this.documentUrl,
  });

  factory WillItem.fromJson(Map<String, dynamic> json) {
    return WillItem(
      id: json['id'] as String,
      type: WillItemType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => WillItemType.other,
      ),
      description: json['description'] as String,
      beneficiary: json['beneficiary'] as String,
      estimatedValue: json['estimated_value'] != null
          ? (json['estimated_value'] as num).toDouble()
          : null,
      documentUrl: json['document_url'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'description': description,
      'beneficiary': beneficiary,
      'estimated_value': estimatedValue,
      'document_url': documentUrl,
    };
  }

  WillItem copyWith({
    String? id,
    WillItemType? type,
    String? description,
    String? beneficiary,
    double? estimatedValue,
    String? documentUrl,
  }) {
    return WillItem(
      id: id ?? this.id,
      type: type ?? this.type,
      description: description ?? this.description,
      beneficiary: beneficiary ?? this.beneficiary,
      estimatedValue: estimatedValue ?? this.estimatedValue,
      documentUrl: documentUrl ?? this.documentUrl,
    );
  }
}
