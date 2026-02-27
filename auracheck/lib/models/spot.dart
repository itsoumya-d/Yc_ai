class SkinSpot {
  final String id;
  final String name;
  final String locationOnBody;
  final DateTime firstDetected;
  final String? latestPhotoUrl;
  final RiskLevel aiRiskLevel;
  final String? notes;
  final List<SpotPhoto> photos;

  const SkinSpot({
    required this.id,
    required this.name,
    required this.locationOnBody,
    required this.firstDetected,
    this.latestPhotoUrl,
    required this.aiRiskLevel,
    this.notes,
    this.photos = const [],
  });

  bool get hasRecentCheck {
    if (photos.isEmpty) return false;
    final latest = photos.reduce((a, b) => a.takenAt.isAfter(b.takenAt) ? a : b);
    return DateTime.now().difference(latest.takenAt).inDays <= 30;
  }

  DateTime? get lastChecked {
    if (photos.isEmpty) return null;
    return photos.reduce((a, b) => a.takenAt.isAfter(b.takenAt) ? a : b).takenAt;
  }

  factory SkinSpot.fromJson(Map<String, dynamic> json) {
    return SkinSpot(
      id: json['id'] as String,
      name: json['name'] as String,
      locationOnBody: json['location_on_body'] as String,
      firstDetected: DateTime.parse(json['first_detected'] as String),
      latestPhotoUrl: json['latest_photo_url'] as String?,
      aiRiskLevel: RiskLevel.values.firstWhere(
        (e) => e.name == json['ai_risk_level'],
        orElse: () => RiskLevel.low,
      ),
      notes: json['notes'] as String?,
      photos: (json['photos'] as List? ?? [])
          .map((p) => SpotPhoto.fromJson(p as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'location_on_body': locationOnBody,
      'first_detected': firstDetected.toIso8601String(),
      'latest_photo_url': latestPhotoUrl,
      'ai_risk_level': aiRiskLevel.name,
      'notes': notes,
    };
  }

  SkinSpot copyWith({
    String? id, String? name, String? locationOnBody, DateTime? firstDetected,
    String? latestPhotoUrl, RiskLevel? aiRiskLevel, String? notes, List<SpotPhoto>? photos,
  }) {
    return SkinSpot(
      id: id ?? this.id,
      name: name ?? this.name,
      locationOnBody: locationOnBody ?? this.locationOnBody,
      firstDetected: firstDetected ?? this.firstDetected,
      latestPhotoUrl: latestPhotoUrl ?? this.latestPhotoUrl,
      aiRiskLevel: aiRiskLevel ?? this.aiRiskLevel,
      notes: notes ?? this.notes,
      photos: photos ?? this.photos,
    );
  }

  static List<SkinSpot> sampleData() {
    final now = DateTime.now();
    return [
      SkinSpot(
        id: 's1',
        name: 'Left Shoulder Mole',
        locationOnBody: 'left_shoulder',
        firstDetected: now.subtract(const Duration(days: 90)),
        aiRiskLevel: RiskLevel.low,
        notes: 'Stable, no changes observed',
        photos: [
          SpotPhoto(id: 'p1', spotId: 's1', takenAt: now.subtract(const Duration(days: 7)), aiAnalysis: 'No significant changes detected. Appearance consistent with previous photos.', changeDetected: false),
          SpotPhoto(id: 'p2', spotId: 's1', takenAt: now.subtract(const Duration(days: 37)), aiAnalysis: 'Stable appearance. Border is regular and color is uniform.', changeDetected: false),
        ],
      ),
      SkinSpot(
        id: 's2',
        name: 'Back Spot #2',
        locationOnBody: 'upper_back',
        firstDetected: now.subtract(const Duration(days: 45)),
        aiRiskLevel: RiskLevel.moderate,
        notes: 'Slight color change noticed last month',
        photos: [
          SpotPhoto(id: 'p3', spotId: 's2', takenAt: now.subtract(const Duration(days: 5)), aiAnalysis: 'Color variation detected compared to previous photo. Recommend monitoring closely or consulting dermatologist.', changeDetected: true),
        ],
      ),
      SkinSpot(
        id: 's3',
        name: 'Right Forearm Spot',
        locationOnBody: 'right_forearm',
        firstDetected: now.subtract(const Duration(days: 180)),
        aiRiskLevel: RiskLevel.high,
        notes: 'Irregular border, recommend dermatologist visit',
        photos: [
          SpotPhoto(id: 'p4', spotId: 's3', takenAt: now.subtract(const Duration(days: 3)), aiAnalysis: 'Irregular border with asymmetric appearance. Significant change from 30 days ago. Dermatologist consultation recommended.', changeDetected: true),
        ],
      ),
    ];
  }
}

class SpotPhoto {
  final String id;
  final String spotId;
  final String? url;
  final String? localPath;
  final DateTime takenAt;
  final String? aiAnalysis;
  final bool changeDetected;

  const SpotPhoto({
    required this.id,
    required this.spotId,
    this.url,
    this.localPath,
    required this.takenAt,
    this.aiAnalysis,
    this.changeDetected = false,
  });

  factory SpotPhoto.fromJson(Map<String, dynamic> json) {
    return SpotPhoto(
      id: json['id'] as String,
      spotId: json['spot_id'] as String,
      url: json['url'] as String?,
      takenAt: DateTime.parse(json['taken_at'] as String),
      aiAnalysis: json['ai_analysis'] as String?,
      changeDetected: json['change_detected'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'spot_id': spotId,
      'url': url,
      'taken_at': takenAt.toIso8601String(),
      'ai_analysis': aiAnalysis,
      'change_detected': changeDetected,
    };
  }
}

enum RiskLevel { low, moderate, high, urgent }

extension RiskLevelExtension on RiskLevel {
  String get displayName {
    switch (this) {
      case RiskLevel.low: return 'Low Risk';
      case RiskLevel.moderate: return 'Moderate';
      case RiskLevel.high: return 'High Risk';
      case RiskLevel.urgent: return 'Urgent';
    }
  }

  int get colorValue {
    switch (this) {
      case RiskLevel.low: return 0xFF22C55E;
      case RiskLevel.moderate: return 0xFFF59E0B;
      case RiskLevel.high: return 0xFFF97316;
      case RiskLevel.urgent: return 0xFFEF4444;
    }
  }

  String get recommendation {
    switch (this) {
      case RiskLevel.low: return 'Continue monthly monitoring';
      case RiskLevel.moderate: return 'Monitor weekly, schedule check-up within 3 months';
      case RiskLevel.high: return 'Schedule dermatologist appointment within 2-4 weeks';
      case RiskLevel.urgent: return 'See a dermatologist as soon as possible';
    }
  }
}
