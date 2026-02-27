import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/diagnosis.dart';

class AiDiagnosisService {
  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.fieldlens.example.com',
  );

  Future<Diagnosis> analyze({
    File? imageFile,
    required String description,
    required String trade,
  }) async {
    // Simulate API call for demo purposes
    await Future.delayed(const Duration(seconds: 2));

    // In production, this would send image + description to your backend
    // which calls an AI vision model (GPT-4V, Claude, Gemini, etc.)
    if (true) {
      // Return sample diagnosis for demo
      return _generateSampleDiagnosis(description, trade);
    }

    // Real implementation below:
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$_baseUrl/api/v1/diagnose'),
    );

    request.fields['description'] = description;
    request.fields['trade'] = trade;

    if (imageFile != null) {
      request.files.add(await http.MultipartFile.fromPath('image', imageFile.path));
    }

    final response = await request.send();
    final body = await response.stream.bytesToString();

    if (response.statusCode != 200) {
      throw Exception('AI analysis failed: ${response.statusCode}');
    }

    final json = jsonDecode(body) as Map<String, dynamic>;
    return Diagnosis.fromJson(json);
  }

  Diagnosis _generateSampleDiagnosis(String description, String trade) {
    final Map<String, List<String>> tradeSteps = {
      'plumbing': [
        'Turn off the water supply at the nearest shutoff valve',
        'Drain remaining water by opening the lowest faucet',
        'Inspect all connections for visible corrosion or loose fittings',
        'Tighten compression fittings with an adjustable wrench (quarter-turn at a time)',
        'Replace any damaged washers or O-rings',
        'Apply plumber\'s tape to threaded connections before reassembly',
        'Turn water on slowly and check for leaks',
        'Test all affected fixtures for proper operation',
      ],
      'electrical': [
        'Switch off the circuit breaker for the affected circuit',
        'Use a non-contact voltage tester to confirm power is off',
        'Remove the outlet or switch cover plate',
        'Inspect wiring for burn marks, loose connections, or damage',
        'Tighten all wire connections at terminal screws',
        'Replace the device if terminals show burn marks',
        'Restore power and test operation',
        'Install a GFCI outlet if this is a wet area',
      ],
      'hvac': [
        'Turn the system to OFF at the thermostat',
        'Check and replace the air filter (do this monthly in heavy use seasons)',
        'Clear any debris from around the outdoor condenser unit',
        'Check drain pan for water and clear condensate drain line',
        'Inspect refrigerant lines for ice buildup (sign of low refrigerant)',
        'Check that all vents are open and unobstructed',
        'Listen for unusual sounds when restarting the system',
        'If no cold air after these steps, call an HVAC technician',
      ],
    };

    final steps = tradeSteps[trade] ?? tradeSteps['plumbing']!;

    return Diagnosis(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      trade: trade,
      problemDescription: description,
      aiAnalysis: 'Based on your description, this appears to be a common $trade issue. '
          'The problem you\'ve described matches typical symptoms of a fixable situation. '
          'Follow the steps below carefully. If the problem persists after completing these steps, '
          'consider consulting a licensed $trade technician.',
      fixSteps: steps,
      partsNeeded: _partsForTrade(trade),
      safetyWarnings: _warningsForTrade(trade),
      createdAt: DateTime.now(),
    );
  }

  List<String> _partsForTrade(String trade) {
    switch (trade) {
      case 'plumbing':
        return ['Plumber\'s tape (Teflon tape)', 'Replacement washers/O-rings', 'Pipe wrench or channel-lock pliers'];
      case 'electrical':
        return ['Replacement outlet or switch', 'Wire nuts', 'Voltage tester', 'Electrical tape'];
      case 'hvac':
        return ['Air filter (check unit for size)', 'Condensate drain cleaner tablets', 'HVAC fin comb (optional)'];
      default:
        return ['Appropriate repair materials for the issue identified'];
    }
  }

  List<SafetyWarning> _warningsForTrade(String trade) {
    switch (trade) {
      case 'plumbing':
        return [
          SafetyWarning(severity: WarningSeverity.medium, title: 'Water Damage', description: 'Place towels and a bucket before starting any work to protect from water damage.'),
        ];
      case 'electrical':
        return [
          SafetyWarning(severity: WarningSeverity.critical, title: 'Electrocution Risk', description: 'ALWAYS verify power is off with a voltage tester before touching any wires. Never assume the breaker is correctly labeled.'),
          SafetyWarning(severity: WarningSeverity.high, title: 'Fire Hazard', description: 'Do not use a breaker that has tripped more than 3 times. This may indicate a short circuit requiring professional evaluation.'),
        ];
      case 'hvac':
        return [
          SafetyWarning(severity: WarningSeverity.medium, title: 'Refrigerant Safety', description: 'Do not attempt to handle refrigerant lines yourself. Refrigerant handling requires EPA 608 certification.'),
        ];
      default:
        return [];
    }
  }
}
