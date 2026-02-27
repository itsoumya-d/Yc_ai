enum ClaimType {
  chargeback,
  refund,
  billingError,
  insurance,
  serviceFailed,
  subscriptionCancel,
}

extension ClaimTypeExtension on ClaimType {
  String get label {
    switch (this) {
      case ClaimType.chargeback:
        return 'Chargeback';
      case ClaimType.refund:
        return 'Refund Request';
      case ClaimType.billingError:
        return 'Billing Error';
      case ClaimType.insurance:
        return 'Insurance Claim';
      case ClaimType.serviceFailed:
        return 'Service Not Rendered';
      case ClaimType.subscriptionCancel:
        return 'Subscription Cancellation';
    }
  }

  String get description {
    switch (this) {
      case ClaimType.chargeback:
        return 'Dispute a charge with your bank or credit card';
      case ClaimType.refund:
        return 'Request a refund from a merchant';
      case ClaimType.billingError:
        return 'Correct an incorrect charge on your bill';
      case ClaimType.insurance:
        return 'File or appeal an insurance claim';
      case ClaimType.serviceFailed:
        return 'Get compensation for services not delivered';
      case ClaimType.subscriptionCancel:
        return 'Cancel and get refund for unwanted subscriptions';
    }
  }
}

enum ClaimStatus {
  draft,
  filed,
  pending,
  won,
  lost,
  settled,
  withdrawn,
}

extension ClaimStatusExtension on ClaimStatus {
  String get label {
    switch (this) {
      case ClaimStatus.draft:
        return 'Draft';
      case ClaimStatus.filed:
        return 'Filed';
      case ClaimStatus.pending:
        return 'Pending';
      case ClaimStatus.won:
        return 'Won';
      case ClaimStatus.lost:
        return 'Lost';
      case ClaimStatus.settled:
        return 'Settled';
      case ClaimStatus.withdrawn:
        return 'Withdrawn';
    }
  }
}

class Claim {
  final String id;
  final ClaimType type;
  final String company;
  final double amount;
  final String description;
  final ClaimStatus status;
  final List<String> evidenceUrls;
  final DateTime createdAt;
  final String? resolution;
  final String? generatedLetter;
  final double? recoveredAmount;

  const Claim({
    required this.id,
    required this.type,
    required this.company,
    required this.amount,
    required this.description,
    required this.status,
    required this.evidenceUrls,
    required this.createdAt,
    this.resolution,
    this.generatedLetter,
    this.recoveredAmount,
  });

  factory Claim.fromJson(Map<String, dynamic> json) {
    return Claim(
      id: json['id'] as String,
      type: ClaimType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => ClaimType.refund,
      ),
      company: json['company'] as String,
      amount: (json['amount'] as num).toDouble(),
      description: json['description'] as String,
      status: ClaimStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => ClaimStatus.draft,
      ),
      evidenceUrls: List<String>.from(json['evidence_urls'] as List? ?? []),
      createdAt: DateTime.parse(json['created_at'] as String),
      resolution: json['resolution'] as String?,
      generatedLetter: json['generated_letter'] as String?,
      recoveredAmount: json['recovered_amount'] != null
          ? (json['recovered_amount'] as num).toDouble()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'company': company,
      'amount': amount,
      'description': description,
      'status': status.name,
      'evidence_urls': evidenceUrls,
      'created_at': createdAt.toIso8601String(),
      'resolution': resolution,
      'generated_letter': generatedLetter,
      'recovered_amount': recoveredAmount,
    };
  }

  Claim copyWith({
    String? id,
    ClaimType? type,
    String? company,
    double? amount,
    String? description,
    ClaimStatus? status,
    List<String>? evidenceUrls,
    DateTime? createdAt,
    String? resolution,
    String? generatedLetter,
    double? recoveredAmount,
  }) {
    return Claim(
      id: id ?? this.id,
      type: type ?? this.type,
      company: company ?? this.company,
      amount: amount ?? this.amount,
      description: description ?? this.description,
      status: status ?? this.status,
      evidenceUrls: evidenceUrls ?? this.evidenceUrls,
      createdAt: createdAt ?? this.createdAt,
      resolution: resolution ?? this.resolution,
      generatedLetter: generatedLetter ?? this.generatedLetter,
      recoveredAmount: recoveredAmount ?? this.recoveredAmount,
    );
  }
}
