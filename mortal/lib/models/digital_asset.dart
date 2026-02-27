enum DigitalAssetCategory {
  socialMedia,
  banking,
  subscription,
  crypto,
  email,
  storage,
  other,
}

extension DigitalAssetCategoryExtension on DigitalAssetCategory {
  String get label {
    switch (this) {
      case DigitalAssetCategory.socialMedia:
        return 'Social Media';
      case DigitalAssetCategory.banking:
        return 'Banking';
      case DigitalAssetCategory.subscription:
        return 'Subscription';
      case DigitalAssetCategory.crypto:
        return 'Cryptocurrency';
      case DigitalAssetCategory.email:
        return 'Email';
      case DigitalAssetCategory.storage:
        return 'Cloud Storage';
      case DigitalAssetCategory.other:
        return 'Other';
    }
  }
}

class DigitalAsset {
  final String id;
  final String platform;
  final String username;
  final String? passwordHint;
  final String instructions;
  final DigitalAssetCategory category;
  final bool hasMonetaryValue;

  const DigitalAsset({
    required this.id,
    required this.platform,
    required this.username,
    this.passwordHint,
    required this.instructions,
    required this.category,
    this.hasMonetaryValue = false,
  });

  factory DigitalAsset.fromJson(Map<String, dynamic> json) {
    return DigitalAsset(
      id: json['id'] as String,
      platform: json['platform'] as String,
      username: json['username'] as String,
      passwordHint: json['password_hint'] as String?,
      instructions: json['instructions'] as String,
      category: DigitalAssetCategory.values.firstWhere(
        (e) => e.name == json['category'],
        orElse: () => DigitalAssetCategory.other,
      ),
      hasMonetaryValue: json['has_monetary_value'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'platform': platform,
      'username': username,
      'password_hint': passwordHint,
      'instructions': instructions,
      'category': category.name,
      'has_monetary_value': hasMonetaryValue,
    };
  }
}
