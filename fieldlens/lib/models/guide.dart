class Guide {
  final String id;
  final String trade;
  final String title;
  final GuideDifficulty difficulty;
  final String timeEstimate;
  final List<String> toolsNeeded;
  final List<GuideStep> steps;
  final List<String> safetyNotes;
  final String? thumbnailEmoji;

  const Guide({
    required this.id,
    required this.trade,
    required this.title,
    required this.difficulty,
    required this.timeEstimate,
    required this.toolsNeeded,
    required this.steps,
    required this.safetyNotes,
    this.thumbnailEmoji,
  });

  factory Guide.fromJson(Map<String, dynamic> json) {
    return Guide(
      id: json['id'] as String,
      trade: json['trade'] as String,
      title: json['title'] as String,
      difficulty: GuideDifficulty.values.firstWhere(
        (e) => e.name == json['difficulty'],
        orElse: () => GuideDifficulty.beginner,
      ),
      timeEstimate: json['time_estimate'] as String,
      toolsNeeded: List<String>.from(json['tools_needed'] as List? ?? []),
      steps: (json['steps'] as List? ?? [])
          .map((s) => GuideStep.fromJson(s as Map<String, dynamic>))
          .toList(),
      safetyNotes: List<String>.from(json['safety_notes'] as List? ?? []),
      thumbnailEmoji: json['thumbnail_emoji'] as String?,
    );
  }

  static List<Guide> sampleData() {
    return [
      Guide(
        id: 'g1',
        trade: 'plumbing',
        title: 'Replace a Leaking Faucet',
        difficulty: GuideDifficulty.beginner,
        timeEstimate: '45-60 min',
        thumbnailEmoji: '🚿',
        toolsNeeded: ['Adjustable wrench', 'Pliers', 'Plumber\'s tape', 'Bucket', 'Flashlight'],
        steps: [
          GuideStep(stepNumber: 1, title: 'Shut off water supply', instruction: 'Turn off the shut-off valves under the sink. If there are none, turn off the main water supply.'),
          GuideStep(stepNumber: 2, title: 'Remove faucet handles', instruction: 'Remove decorative caps, unscrew handle screws, and pull handles off the stems.'),
          GuideStep(stepNumber: 3, title: 'Disconnect supply lines', instruction: 'Use an adjustable wrench to disconnect the water supply lines from the faucet.'),
          GuideStep(stepNumber: 4, title: 'Remove mounting nuts', instruction: 'Underneath the sink, remove the mounting nuts holding the faucet to the sink deck.'),
          GuideStep(stepNumber: 5, title: 'Install new faucet', instruction: 'Follow manufacturer instructions to install the new faucet, working from underneath the sink.'),
          GuideStep(stepNumber: 6, title: 'Reconnect supply lines', instruction: 'Reconnect and hand-tighten supply lines, then use a wrench for 1/4 turn more.'),
          GuideStep(stepNumber: 7, title: 'Test for leaks', instruction: 'Turn water back on slowly, check all connections, and test hot and cold operation.'),
        ],
        safetyNotes: ['Always turn off water before starting', 'Have towels ready for residual water', 'Do not overtighten connections'],
      ),
      Guide(
        id: 'g2',
        trade: 'electrical',
        title: 'Install a GFCI Outlet',
        difficulty: GuideDifficulty.intermediate,
        timeEstimate: '30-45 min',
        thumbnailEmoji: '⚡',
        toolsNeeded: ['Voltage tester', 'Screwdrivers (flat and Phillips)', 'Wire stripper', 'GFCI outlet', 'Electrical tape'],
        steps: [
          GuideStep(stepNumber: 1, title: 'Turn off power at breaker', instruction: 'Switch off the circuit breaker for the outlet you\'re replacing. Test with a voltage tester to confirm.'),
          GuideStep(stepNumber: 2, title: 'Remove old outlet', instruction: 'Unscrew the cover plate, remove the outlet from the box, and carefully pull it out.'),
          GuideStep(stepNumber: 3, title: 'Document wire connections', instruction: 'Take a photo of existing wiring before disconnecting anything.'),
          GuideStep(stepNumber: 4, title: 'Connect wires to GFCI', instruction: 'Connect black wire to LINE hot (brass), white to LINE neutral (silver), bare copper to ground.'),
          GuideStep(stepNumber: 5, title: 'Push back and secure', instruction: 'Carefully fold wires into box, push GFCI in, and secure with screws.'),
          GuideStep(stepNumber: 6, title: 'Test and reset', instruction: 'Turn power back on. Press RESET button on GFCI. Test with a lamp or GFCI tester.'),
        ],
        safetyNotes: [
          'ALWAYS verify power is off with a voltage tester before touching wires',
          'Never work on live circuits',
          'If wiring is aluminum (silver-colored), consult a licensed electrician',
          'Required in bathrooms, kitchens, garages, and outdoors per NEC code',
        ],
      ),
      Guide(
        id: 'g3',
        trade: 'hvac',
        title: 'Clean and Replace AC Filter',
        difficulty: GuideDifficulty.beginner,
        timeEstimate: '10-15 min',
        thumbnailEmoji: '❄️',
        toolsNeeded: ['Replacement filter (correct size)', 'Vacuum with brush attachment', 'Screwdriver (if needed)'],
        steps: [
          GuideStep(stepNumber: 1, title: 'Turn off HVAC system', instruction: 'Set thermostat to OFF before accessing the filter to prevent unfiltered air circulation.'),
          GuideStep(stepNumber: 2, title: 'Locate filter compartment', instruction: 'Find the filter — usually in the return air vent, air handler, or furnace. Check your manual.'),
          GuideStep(stepNumber: 3, title: 'Note filter size', instruction: 'Look at the old filter for dimensions (e.g., 16x20x1). Buy the same size replacement.'),
          GuideStep(stepNumber: 4, title: 'Remove old filter', instruction: 'Slide out the filter carefully — it will be dusty. Place in a bag immediately.'),
          GuideStep(stepNumber: 5, title: 'Clean the compartment', instruction: 'Vacuum any dust from the compartment before inserting the new filter.'),
          GuideStep(stepNumber: 6, title: 'Install new filter', instruction: 'Insert new filter with arrow pointing toward the air handler/furnace (in direction of airflow).'),
        ],
        safetyNotes: ['Change filters every 1-3 months', 'Wear a dust mask when handling old filters'],
      ),
    ];
  }
}

class GuideStep {
  final int stepNumber;
  final String title;
  final String instruction;
  final String? imageUrl;
  final String? tip;

  const GuideStep({
    required this.stepNumber,
    required this.title,
    required this.instruction,
    this.imageUrl,
    this.tip,
  });

  factory GuideStep.fromJson(Map<String, dynamic> json) {
    return GuideStep(
      stepNumber: (json['step_number'] as num).toInt(),
      title: json['title'] as String,
      instruction: json['instruction'] as String,
      imageUrl: json['image_url'] as String?,
      tip: json['tip'] as String?,
    );
  }
}

enum GuideDifficulty { beginner, intermediate, advanced }

extension GuideDifficultyExtension on GuideDifficulty {
  String get displayName {
    switch (this) {
      case GuideDifficulty.beginner: return 'Beginner';
      case GuideDifficulty.intermediate: return 'Intermediate';
      case GuideDifficulty.advanced: return 'Advanced';
    }
  }

  int get colorValue {
    switch (this) {
      case GuideDifficulty.beginner: return 0xFF22C55E;
      case GuideDifficulty.intermediate: return 0xFFF59E0B;
      case GuideDifficulty.advanced: return 0xFFEF4444;
    }
  }
}
