import 'package:flutter/material.dart';

class SafetyScreen extends StatefulWidget {
  const SafetyScreen({super.key});

  @override
  State<SafetyScreen> createState() => _SafetyScreenState();
}

class _SafetyScreenState extends State<SafetyScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Safety Checklists'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFFFBBF24),
          unselectedLabelColor: Colors.grey,
          indicatorColor: const Color(0xFFFBBF24),
          tabs: const [
            Tab(text: 'Plumbing'),
            Tab(text: 'Electrical'),
            Tab(text: 'HVAC'),
            Tab(text: 'General'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _SafetyChecklist(checklists: _plumbingChecklist),
          _SafetyChecklist(checklists: _electricalChecklist),
          _SafetyChecklist(checklists: _hvacChecklist),
          _SafetyChecklist(checklists: _generalChecklist),
        ],
      ),
    );
  }

  static const List<_ChecklistItem> _plumbingChecklist = [
    _ChecklistItem(text: 'Water supply shut off before starting work', severity: 'required'),
    _ChecklistItem(text: 'Bucket and towels in place for drainage', severity: 'recommended'),
    _ChecklistItem(text: 'Work area free of slip hazards (wet floors)', severity: 'required'),
    _ChecklistItem(text: 'Safety glasses worn when working under sink', severity: 'recommended'),
    _ChecklistItem(text: 'Hot water heater off if working on hot water lines', severity: 'required'),
    _ChecklistItem(text: 'Gas shut off before working on gas lines', severity: 'critical'),
    _ChecklistItem(text: 'Gas leak test performed after any gas work', severity: 'critical'),
    _ChecklistItem(text: 'Area ventilated when using PVC cement or solvents', severity: 'required'),
  ];

  static const List<_ChecklistItem> _electricalChecklist = [
    _ChecklistItem(text: 'Circuit breaker switched OFF', severity: 'critical'),
    _ChecklistItem(text: 'Non-contact voltage tester used to verify power is off', severity: 'critical'),
    _ChecklistItem(text: 'Breaker labeled or locked out to prevent accidental re-energizing', severity: 'required'),
    _ChecklistItem(text: 'One-hand rule used when working near live components', severity: 'recommended'),
    _ChecklistItem(text: 'Rubber-soled shoes worn', severity: 'recommended'),
    _ChecklistItem(text: 'No work performed on wet surfaces or in rain', severity: 'required'),
    _ChecklistItem(text: 'Wire gauges verified to match circuit amperage', severity: 'required'),
    _ChecklistItem(text: 'All connections made before restoring power', severity: 'required'),
    _ChecklistItem(text: 'GFCI protection in wet areas (NEC code)', severity: 'required'),
  ];

  static const List<_ChecklistItem> _hvacChecklist = [
    _ChecklistItem(text: 'System powered off at thermostat and breaker', severity: 'required'),
    _ChecklistItem(text: 'Capacitors discharged before touching electrical components', severity: 'critical'),
    _ChecklistItem(text: 'EPA 608 certification for refrigerant handling', severity: 'critical'),
    _ChecklistItem(text: 'Safety glasses worn when inspecting condenser coils', severity: 'recommended'),
    _ChecklistItem(text: 'Gloves worn when handling sharp fin edges', severity: 'recommended'),
    _ChecklistItem(text: 'Area around unit clear before starting fan motor', severity: 'required'),
    _ChecklistItem(text: 'CO detector functioning after any combustion work', severity: 'critical'),
  ];

  static const List<_ChecklistItem> _generalChecklist = [
    _ChecklistItem(text: 'Work area properly lit', severity: 'recommended'),
    _ChecklistItem(text: 'First aid kit accessible', severity: 'recommended'),
    _ChecklistItem(text: 'Phone charged and available for emergencies', severity: 'recommended'),
    _ChecklistItem(text: 'Ladder on stable, level surface if needed', severity: 'required'),
    _ChecklistItem(text: 'Appropriate PPE for the task (glasses, gloves, mask)', severity: 'recommended'),
    _ChecklistItem(text: 'Read tool manuals before using unfamiliar equipment', severity: 'recommended'),
    _ChecklistItem(text: 'Children and pets removed from work area', severity: 'required'),
  ];
}

class _SafetyChecklist extends StatefulWidget {
  final List<_ChecklistItem> checklists;

  const _SafetyChecklist({required this.checklists});

  @override
  State<_SafetyChecklist> createState() => _SafetyChecklistState();
}

class _SafetyChecklistState extends State<_SafetyChecklist> {
  final Set<int> _checked = {};

  @override
  Widget build(BuildContext context) {
    final completedCount = _checked.length;
    final total = widget.checklists.length;
    final progress = total > 0 ? completedCount / total : 0.0;

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          color: const Color(0xFF1C1917),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('$completedCount of $total items checked', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                    const SizedBox(height: 6),
                    LinearProgressIndicator(
                      value: progress,
                      backgroundColor: Colors.white24,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        progress == 1.0 ? const Color(0xFF22C55E) : const Color(0xFFFBBF24),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              if (progress == 1.0)
                const Icon(Icons.check_circle, color: Color(0xFF22C55E), size: 28)
              else
                TextButton(
                  onPressed: () => setState(() => _checked.clear()),
                  child: const Text('Reset', style: TextStyle(color: Color(0xFFFBBF24))),
                ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: widget.checklists.length,
            itemBuilder: (ctx, i) {
              final item = widget.checklists[i];
              final isChecked = _checked.contains(i);
              final severityColor = _colorForSeverity(item.severity);

              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                color: isChecked ? const Color(0xFFF0FDF4) : null,
                child: CheckboxListTile(
                  value: isChecked,
                  onChanged: (v) {
                    setState(() {
                      if (v == true) _checked.add(i); else _checked.remove(i);
                    });
                  },
                  title: Text(
                    item.text,
                    style: TextStyle(
                      fontSize: 14,
                      decoration: isChecked ? TextDecoration.lineThrough : null,
                      color: isChecked ? Colors.grey : null,
                    ),
                  ),
                  secondary: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: severityColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      item.severity.toUpperCase(),
                      style: TextStyle(fontSize: 10, color: severityColor, fontWeight: FontWeight.w700),
                    ),
                  ),
                  controlAffinity: ListTileControlAffinity.leading,
                  activeColor: const Color(0xFF22C55E),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Color _colorForSeverity(String severity) {
    switch (severity) {
      case 'critical': return const Color(0xFFEF4444);
      case 'required': return const Color(0xFFF97316);
      default: return const Color(0xFF3B82F6);
    }
  }
}

class _ChecklistItem {
  final String text;
  final String severity;
  const _ChecklistItem({required this.text, required this.severity});
}
