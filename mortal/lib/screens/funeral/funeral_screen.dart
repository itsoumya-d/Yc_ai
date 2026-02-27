import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/planning_provider.dart';
import '../../theme/app_theme.dart';

class FuneralScreen extends ConsumerStatefulWidget {
  const FuneralScreen({super.key});

  @override
  ConsumerState<FuneralScreen> createState() => _FuneralScreenState();
}

class _FuneralScreenState extends ConsumerState<FuneralScreen> {
  late Map<String, dynamic> _prefs;
  late TextEditingController _readingsController;
  late TextEditingController _musicController;
  late TextEditingController _venueController;
  late TextEditingController _notesController;

  @override
  void initState() {
    super.initState();
    _prefs = Map.from(ref.read(planningProvider).funeralPreferences);
    _readingsController = TextEditingController(text: _prefs['readings'] as String? ?? '');
    _musicController = TextEditingController(text: _prefs['music'] as String? ?? '');
    _venueController = TextEditingController(text: _prefs['venue'] as String? ?? '');
    _notesController = TextEditingController(text: _prefs['notes'] as String? ?? '');
  }

  @override
  void dispose() {
    _readingsController.dispose();
    _musicController.dispose();
    _venueController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _save() {
    final updated = {
      ..._prefs,
      'readings': _readingsController.text,
      'music': _musicController.text,
      'venue': _venueController.text,
      'notes': _notesController.text,
    };
    ref.read(planningProvider.notifier).updateFuneralPreferences(updated);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Preferences saved'),
        backgroundColor: AppTheme.successGreen,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(
        title: const Text('Funeral Preferences'),
        backgroundColor: AppTheme.sage,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
        actions: [
          TextButton(
            onPressed: _save,
            child: const Text('Save', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.sage.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.sage.withOpacity(0.3)),
              ),
              child: const Text(
                'Your preferences will help your loved ones honor your wishes during a difficult time.',
                style: TextStyle(fontSize: 13, color: Color(0xFF4A7C59), height: 1.5),
              ),
            ),
            const SizedBox(height: 24),
            _SectionLabel(title: 'Disposition'),
            _OptionGroup(
              selectedValue: _prefs['type'] as String? ?? '',
              options: const [
                {'value': 'burial', 'label': 'Traditional Burial'},
                {'value': 'cremation', 'label': 'Cremation'},
                {'value': 'green', 'label': 'Green Burial'},
                {'value': 'donation', 'label': 'Body Donation'},
              ],
              onChanged: (v) => setState(() => _prefs['type'] = v),
            ),
            const SizedBox(height: 20),
            _SectionLabel(title: 'Ceremony Type'),
            _OptionGroup(
              selectedValue: _prefs['ceremony'] as String? ?? '',
              options: const [
                {'value': 'traditional', 'label': 'Traditional Service'},
                {'value': 'small private service', 'label': 'Small Private Service'},
                {'value': 'celebration', 'label': 'Celebration of Life'},
                {'value': 'none', 'label': 'No Service'},
              ],
              onChanged: (v) => setState(() => _prefs['ceremony'] = v),
            ),
            const SizedBox(height: 20),
            _SectionLabel(title: 'Include Reception'),
            SwitchListTile(
              value: _prefs['reception'] as bool? ?? false,
              onChanged: (v) => setState(() => _prefs['reception'] = v),
              title: const Text('Host a reception after service', style: TextStyle(fontSize: 14)),
              contentPadding: EdgeInsets.zero,
              activeColor: AppTheme.primaryTeal,
            ),
            const SizedBox(height: 16),
            _SectionLabel(title: 'Venue'),
            TextField(
              controller: _venueController,
              decoration: const InputDecoration(
                hintText: 'Church, funeral home, park, etc.',
              ),
            ),
            const SizedBox(height: 16),
            _SectionLabel(title: 'Readings'),
            TextField(
              controller: _readingsController,
              maxLines: 2,
              decoration: const InputDecoration(
                hintText: 'Scripture, poem, or passages you would like read',
              ),
            ),
            const SizedBox(height: 16),
            _SectionLabel(title: 'Music'),
            TextField(
              controller: _musicController,
              maxLines: 2,
              decoration: const InputDecoration(
                hintText: 'Songs or hymns for the service',
              ),
            ),
            const SizedBox(height: 16),
            _SectionLabel(title: 'Additional Notes'),
            TextField(
              controller: _notesController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: 'Flower preferences, dress code, charitable donations in lieu of flowers...',
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _save,
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.sage),
              child: const Text('Save Preferences'),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String title;

  const _SectionLabel({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppTheme.warmBrown,
        ),
      ),
    );
  }
}

class _OptionGroup extends StatelessWidget {
  final String selectedValue;
  final List<Map<String, String>> options;
  final ValueChanged<String> onChanged;

  const _OptionGroup({
    required this.selectedValue,
    required this.options,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: options.map((opt) {
        final isSelected = selectedValue == opt['value'];
        return GestureDetector(
          onTap: () => onChanged(opt['value']!),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? AppTheme.primaryTeal : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected ? AppTheme.primaryTeal : const Color(0xFFD6D3D1),
              ),
            ),
            child: Text(
              opt['label']!,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: isSelected ? Colors.white : AppTheme.warmBrown,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
