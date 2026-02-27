enum ContactRole {
  attorney,
  doctor,
  accountant,
  executor,
  beneficiary,
  familyMember,
  friend,
  financialAdvisor,
  funeralDirector,
  other,
}

extension ContactRoleExtension on ContactRole {
  String get label {
    switch (this) {
      case ContactRole.attorney:
        return 'Attorney';
      case ContactRole.doctor:
        return 'Doctor';
      case ContactRole.accountant:
        return 'Accountant';
      case ContactRole.executor:
        return 'Executor';
      case ContactRole.beneficiary:
        return 'Beneficiary';
      case ContactRole.familyMember:
        return 'Family Member';
      case ContactRole.friend:
        return 'Friend';
      case ContactRole.financialAdvisor:
        return 'Financial Advisor';
      case ContactRole.funeralDirector:
        return 'Funeral Director';
      case ContactRole.other:
        return 'Other';
    }
  }
}

class ImportantContact {
  final String id;
  final String name;
  final ContactRole role;
  final String? phone;
  final String? email;
  final String? relationship;
  final String? notes;

  const ImportantContact({
    required this.id,
    required this.name,
    required this.role,
    this.phone,
    this.email,
    this.relationship,
    this.notes,
  });

  factory ImportantContact.fromJson(Map<String, dynamic> json) {
    return ImportantContact(
      id: json['id'] as String,
      name: json['name'] as String,
      role: ContactRole.values.firstWhere(
        (e) => e.name == json['role'],
        orElse: () => ContactRole.other,
      ),
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      relationship: json['relationship'] as String?,
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'role': role.name,
      'phone': phone,
      'email': email,
      'relationship': relationship,
      'notes': notes,
    };
  }
}
