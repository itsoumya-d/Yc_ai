class Diagnosis {
  final String id;
  final String? imageUrl;
  final String trade;
  final String problemDescription;
  final String aiAnalysis;
  final List<String> fixSteps;
  final List<String> partsNeeded;
  final List<SafetyWarning> safetyWarnings;
  final DateTime createdAt;
  final String? localImagePath;

  const Diagnosis({
    required this.id,
    this.imageUrl,
    required this.trade,
    required this.problemDescription,
    required this.aiAnalysis,
    required this.fixSteps,
    required this.partsNeeded,
    required this.safetyWarnings,
    required this.createdAt,
    this.localImagePath,
  });

  factory Diagnosis.fromJson(Map<String, dynamic> json) {
    return Diagnosis(
      id: json['id'] as String,
      imageUrl: json['image_url'] as String?,
      trade: json['trade'] as String,
      problemDescription: json['problem_description'] as String,
      aiAnalysis: json['ai_analysis'] as String,
      fixSteps: List<String>.from(json['fix_steps'] as List? ?? []),
      partsNeeded: List<String>.from(json['parts_needed'] as List? ?? []),
      safetyWarnings: (json['safety_warnings'] as List? ?? [])
          .map((w) => SafetyWarning.fromJson(w as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'image_url': imageUrl,
      'trade': trade,
      'problem_description': problemDescription,
      'ai_analysis': aiAnalysis,
      'fix_steps': fixSteps,
      'parts_needed': partsNeeded,
      'safety_warnings': safetyWarnings.map((w) => w.toJson()).toList(),
      'created_at': createdAt.toIso8601String(),
    };
  }

  static Diagnosis samplePlumbing() {
    return Diagnosis(
      id: 'diag1',
      trade: 'plumbing',
      problemDescription: 'Leaking pipe under kitchen sink with water pooling',
      aiAnalysis: 'Based on the image analysis, this appears to be a compression fitting failure at the P-trap joint. The corrosion pattern suggests the fitting has been leaking slowly for some time. This is a common issue with older plumbing that can be repaired without replacing the entire drain assembly.',
      fixSteps: [
        'Turn off water supply valve under the sink',
        'Place a bucket under the P-trap to catch remaining water',
        'Unscrew the slip nuts on both ends of the P-trap by hand or with channel-lock pliers',
        'Remove the P-trap and inspect the washers inside the slip nuts',
        'Replace worn or cracked washers with new ones (usually 1.5" or 1.25")',
        'Apply plumber\'s tape to threaded connections if needed',
        'Reinstall the P-trap, hand-tighten slip nuts first',
        'Turn water back on slowly and check for leaks',
        'Tighten further only if still leaking — do not overtighten',
      ],
      partsNeeded: [
        'P-trap assembly (1.5" or 1.25" depending on drain size)',
        'Slip joint washers (pack)',
        'Plumber\'s tape (Teflon tape)',
        'Channel-lock pliers',
      ],
      safetyWarnings: [
        SafetyWarning(
          severity: WarningSeverity.medium,
          title: 'Water Damage Risk',
          description: 'Always place a bucket and towels before starting. Even "off" valves may drip.',
        ),
        SafetyWarning(
          severity: WarningSeverity.low,
          title: 'Mold Check',
          description: 'Inspect the cabinet interior for mold or wood rot if the leak has been ongoing. Address before closing up.',
        ),
      ],
      createdAt: DateTime.now(),
    );
  }
}

class SafetyWarning {
  final WarningSeverity severity;
  final String title;
  final String description;

  const SafetyWarning({
    required this.severity,
    required this.title,
    required this.description,
  });

  factory SafetyWarning.fromJson(Map<String, dynamic> json) {
    return SafetyWarning(
      severity: WarningSeverity.values.firstWhere(
        (e) => e.name == json['severity'],
        orElse: () => WarningSeverity.low,
      ),
      title: json['title'] as String,
      description: json['description'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'severity': severity.name,
    'title': title,
    'description': description,
  };
}

enum WarningSeverity { low, medium, high, critical }

extension WarningSeverityExtension on WarningSeverity {
  String get label {
    switch (this) {
      case WarningSeverity.low: return 'Info';
      case WarningSeverity.medium: return 'Caution';
      case WarningSeverity.high: return 'Warning';
      case WarningSeverity.critical: return 'DANGER';
    }
  }

  int get colorValue {
    switch (this) {
      case WarningSeverity.low: return 0xFF3B82F6;
      case WarningSeverity.medium: return 0xFFF59E0B;
      case WarningSeverity.high: return 0xFFF97316;
      case WarningSeverity.critical: return 0xFFEF4444;
    }
  }
}

enum TradeType { plumbing, electrical, hvac, carpentry, general }

extension TradeTypeExtension on TradeType {
  String get displayName {
    switch (this) {
      case TradeType.plumbing: return 'Plumbing';
      case TradeType.electrical: return 'Electrical';
      case TradeType.hvac: return 'HVAC';
      case TradeType.carpentry: return 'Carpentry';
      case TradeType.general: return 'General';
    }
  }

  int get iconCodePoint {
    switch (this) {
      case TradeType.plumbing: return 0xe57b; // plumbing icon
      case TradeType.electrical: return 0xe1d1; // bolt icon
      case TradeType.hvac: return 0xe3aa; // ac_unit icon
      case TradeType.carpentry: return 0xe739; // handyman icon
      case TradeType.general: return 0xe651; // build icon
    }
  }
}
