import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/spot.dart';

class SpotAnalysisResult {
  final String analysis;
  final RiskLevel riskLevel;
  final bool changeDetected;
  final List<String> recommendations;

  const SpotAnalysisResult({
    required this.analysis,
    required this.riskLevel,
    required this.changeDetected,
    required this.recommendations,
  });

  factory SpotAnalysisResult.fromJson(Map<String, dynamic> json) {
    return SpotAnalysisResult(
      analysis: json['analysis'] as String,
      riskLevel: RiskLevel.values.firstWhere(
        (e) => e.name == json['risk_level'],
        orElse: () => RiskLevel.low,
      ),
      changeDetected: json['change_detected'] as bool? ?? false,
      recommendations: List<String>.from(json['recommendations'] as List? ?? []),
    );
  }
}

class AiAnalysisService {
  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.auracheck.example.com',
  );

  Future<SpotAnalysisResult> analyzeSpot(File imageFile) async {
    // Simulate API call
    await Future.delayed(const Duration(seconds: 2));

    // Return demo result
    return const SpotAnalysisResult(
      analysis: 'The spot appears stable with regular, well-defined borders. Color is uniform without significant variation. Size appears consistent with previous measurements. No immediate concerning features detected.',
      riskLevel: RiskLevel.low,
      changeDetected: false,
      recommendations: [
        'Continue monitoring monthly',
        'Protect the area from prolonged sun exposure',
        'Apply SPF 30+ sunscreen when outdoors',
      ],
    );

    // Real implementation:
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$_baseUrl/api/v1/analyze-spot'),
    );
    request.files.add(await http.MultipartFile.fromPath('image', imageFile.path));
    final response = await request.send();
    final body = await response.stream.bytesToString();
    if (response.statusCode != 200) {
      throw Exception('Analysis failed: ${response.statusCode}');
    }
    return SpotAnalysisResult.fromJson(jsonDecode(body) as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> comparePhotos(File before, File after) async {
    await Future.delayed(const Duration(seconds: 3));
    return {
      'change_detected': false,
      'change_description': 'No significant changes detected between the two photos.',
      'risk_change': 0,
    };
  }
}
