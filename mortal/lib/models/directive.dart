enum DirectiveType {
  healthcareProxy,
  livingWill,
  dnr,
  powerOfAttorney,
  financialPoa,
}

extension DirectiveTypeExtension on DirectiveType {
  String get label {
    switch (this) {
      case DirectiveType.healthcareProxy:
        return 'Healthcare Proxy';
      case DirectiveType.livingWill:
        return 'Living Will';
      case DirectiveType.dnr:
        return 'Do Not Resuscitate (DNR)';
      case DirectiveType.powerOfAttorney:
        return 'Power of Attorney';
      case DirectiveType.financialPoa:
        return 'Financial Power of Attorney';
    }
  }

  String get description {
    switch (this) {
      case DirectiveType.healthcareProxy:
        return 'Designates someone to make medical decisions on your behalf';
      case DirectiveType.livingWill:
        return 'Documents your wishes for end-of-life medical care';
      case DirectiveType.dnr:
        return 'Instructs medical staff not to perform CPR';
      case DirectiveType.powerOfAttorney:
        return 'Grants someone legal authority to act on your behalf';
      case DirectiveType.financialPoa:
        return 'Authorizes someone to manage your finances';
    }
  }
}

class AdvanceDirective {
  final String id;
  final DirectiveType type;
  final String content;
  final bool signed;
  final String? attorneyName;
  final DateTime? signedDate;
  final String? witnessName;

  const AdvanceDirective({
    required this.id,
    required this.type,
    required this.content,
    required this.signed,
    this.attorneyName,
    this.signedDate,
    this.witnessName,
  });

  factory AdvanceDirective.fromJson(Map<String, dynamic> json) {
    return AdvanceDirective(
      id: json['id'] as String,
      type: DirectiveType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => DirectiveType.livingWill,
      ),
      content: json['content'] as String,
      signed: json['signed'] as bool,
      attorneyName: json['attorney_name'] as String?,
      signedDate: json['signed_date'] != null
          ? DateTime.parse(json['signed_date'] as String)
          : null,
      witnessName: json['witness_name'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'content': content,
      'signed': signed,
      'attorney_name': attorneyName,
      'signed_date': signedDate?.toIso8601String(),
      'witness_name': witnessName,
    };
  }

  AdvanceDirective copyWith({
    String? id,
    DirectiveType? type,
    String? content,
    bool? signed,
    String? attorneyName,
    DateTime? signedDate,
    String? witnessName,
  }) {
    return AdvanceDirective(
      id: id ?? this.id,
      type: type ?? this.type,
      content: content ?? this.content,
      signed: signed ?? this.signed,
      attorneyName: attorneyName ?? this.attorneyName,
      signedDate: signedDate ?? this.signedDate,
      witnessName: witnessName ?? this.witnessName,
    );
  }
}
