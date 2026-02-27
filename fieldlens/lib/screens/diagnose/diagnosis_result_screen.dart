import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../models/diagnosis.dart';
import '../../widgets/step_card.dart';
import '../../widgets/safety_warning_card.dart';

class DiagnosisResultScreen extends StatelessWidget {
  final Diagnosis? diagnosis;

  const DiagnosisResultScreen({super.key, this.diagnosis});

  @override
  Widget build(BuildContext context) {
    final d = diagnosis;

    if (d == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Diagnosis Result')),
        body: const Center(child: Text('No diagnosis data available')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Diagnosis Result'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/diagnose'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Share coming soon')));
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Problem header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1C1917), Color(0xFF292524)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(_emojiForTrade(d.trade), style: const TextStyle(fontSize: 28)),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(d.trade.toUpperCase(), style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1)),
                          const Text('Problem Identified', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    d.problemDescription,
                    style: const TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Safety warnings (if any)
            if (d.safetyWarnings.isNotEmpty) ...[
              Row(
                children: [
                  const Icon(Icons.health_and_safety, color: Color(0xFFEF4444), size: 20),
                  const SizedBox(width: 8),
                  const Text('Safety First', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFFEF4444))),
                ],
              ),
              const SizedBox(height: 8),
              ...d.safetyWarnings.map((w) => SafetyWarningCard(warning: w)),
              const SizedBox(height: 16),
            ],

            // AI analysis
            const Text('AI Analysis', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF9C3),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFDE047)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.auto_awesome, color: Color(0xFFCA8A04), size: 18),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(d.aiAnalysis, style: const TextStyle(fontSize: 14, height: 1.5)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Fix steps
            Row(
              children: [
                const Icon(Icons.format_list_numbered, color: Color(0xFFF59E0B), size: 20),
                const SizedBox(width: 8),
                Text('Step-by-Step Fix (${d.fixSteps.length} steps)', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 8),
            ...d.fixSteps.asMap().entries.map((e) => StepCard(
              stepNumber: e.key + 1,
              title: _titleFromStep(e.value),
              instruction: e.value,
              startExpanded: e.key == 0,
            )),
            const SizedBox(height: 20),

            // Parts needed
            if (d.partsNeeded.isNotEmpty) ...[
              Row(
                children: [
                  const Icon(Icons.build_circle_outlined, color: Color(0xFF8B5CF6), size: 20),
                  const SizedBox(width: 8),
                  const Text('Parts & Materials Needed', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                ],
              ),
              const SizedBox(height: 8),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    children: d.partsNeeded.asMap().entries.map((e) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        children: [
                          Container(
                            width: 24,
                            height: 24,
                            decoration: const BoxDecoration(
                              color: Color(0xFFEDE9FE),
                              shape: BoxShape.circle,
                            ),
                            alignment: Alignment.center,
                            child: Text('${e.key + 1}', style: const TextStyle(fontSize: 11, color: Color(0xFF7C3AED), fontWeight: FontWeight.w700)),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Text(e.value, style: const TextStyle(fontSize: 14))),
                        ],
                      ),
                    )).toList(),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Actions
            ElevatedButton.icon(
              onPressed: () => context.go('/parts'),
              icon: const Icon(Icons.shopping_cart_outlined),
              label: const Text('Find These Parts'),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: () => context.go('/safety'),
              icon: const Icon(Icons.health_and_safety_outlined),
              label: const Text('View Safety Checklist'),
              style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  String _emojiForTrade(String trade) {
    switch (trade) {
      case 'plumbing': return '🔧';
      case 'electrical': return '⚡';
      case 'hvac': return '❄️';
      case 'carpentry': return '🪵';
      default: return '🛠️';
    }
  }

  String _titleFromStep(String step) {
    final words = step.split(' ').take(5).join(' ');
    return words.length < step.length ? '$words...' : words;
  }
}
