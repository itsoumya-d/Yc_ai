import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/skin_check.dart';
import '../../providers/spots_provider.dart';
import '../../widgets/body_map_widget.dart';

class CheckScreen extends ConsumerStatefulWidget {
  const CheckScreen({super.key});

  @override
  ConsumerState<CheckScreen> createState() => _CheckScreenState();
}

class _CheckScreenState extends ConsumerState<CheckScreen> {
  final Map<String, bool> _checkedRegions = {};
  int _newSpotsFound = 0;
  final _notesCtrl = TextEditingController();
  bool _isSubmitting = false;
  int _step = 0; // 0 = body map, 1 = summary

  @override
  void dispose() {
    _notesCtrl.dispose();
    super.dispose();
  }

  void _toggleRegion(String region) {
    setState(() {
      _checkedRegions[region] = !(_checkedRegions[region] ?? false);
    });
  }

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);
    final areasChecked = _checkedRegions.entries
        .where((e) => e.value)
        .map((e) => e.key)
        .toList();

    await ref.read(spotsProvider.notifier).completeCheck(
      areasChecked: areasChecked,
      newSpotsFound: _newSpotsFound,
      notes: _notesCtrl.text.isEmpty ? null : _notesCtrl.text,
    );

    if (mounted) {
      _showCompletionDialog();
    }
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('✅', style: TextStyle(fontSize: 48)),
            const SizedBox(height: 12),
            const Text('Check Complete!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text(
              'You checked ${_checkedRegions.values.where((v) => v).length} body areas today. Keep up the great work!',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () {
            Navigator.pop(ctx);
            context.go('/home');
          }, child: const Text('Done')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.go('/spots/add');
            },
            child: const Text('Add New Spot'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(spotsProvider);
    final checkedCount = _checkedRegions.values.where((v) => v).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Daily Skin Check'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.go('/home'),
        ),
      ),
      body: _step == 0 ? _buildBodyMapStep(checkedCount) : _buildSummaryStep(),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: _step == 0
              ? ElevatedButton(
                  onPressed: checkedCount > 0 ? () => setState(() => _step = 1) : null,
                  child: Text('Continue ($checkedCount areas checked)'),
                )
              : ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  child: _isSubmitting
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Complete Today\'s Check'),
                ),
        ),
      ),
    );
  }

  Widget _buildBodyMapStep(int checkedCount) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF1F2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFFDA4AF)),
            ),
            child: const Row(
              children: [
                Icon(Icons.touch_app, color: Color(0xFFE11D48)),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Tap each body area after you\'ve checked it. Look for new spots, changes in color, size, or shape.',
                    style: TextStyle(fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text('Tap areas you\'ve checked:', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
          const SizedBox(height: 16),
          Center(
            child: SizedBox(
              width: 220,
              child: BodyMapWidget(
                checkedRegions: _checkedRegions,
                onRegionTapped: _toggleRegion,
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Checked areas list
          if (checkedCount > 0) ...[
            const Text('Checked:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: _checkedRegions.entries
                  .where((e) => e.value)
                  .map((e) => Chip(
                    label: Text(BodyRegion.displayName(e.key), style: const TextStyle(fontSize: 12)),
                    deleteIcon: const Icon(Icons.close, size: 14),
                    onDeleted: () => _toggleRegion(e.key),
                    backgroundColor: const Color(0xFFFECDD3),
                    side: BorderSide.none,
                  ))
                  .toList(),
            ),
          ],
          // Quick select all
          TextButton.icon(
            onPressed: () {
              setState(() {
                for (final region in BodyRegion.all) {
                  _checkedRegions[region] = true;
                }
              });
            },
            icon: const Icon(Icons.select_all, size: 16),
            label: const Text('Mark All as Checked'),
          ),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildSummaryStep() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Check Summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _SummaryRow(
                    label: 'Areas Checked',
                    value: '${_checkedRegions.values.where((v) => v).length} of ${BodyRegion.all.length}',
                    icon: Icons.check_circle_outline,
                    color: const Color(0xFF22C55E),
                  ),
                  const Divider(),
                  const Text('New spots found today?', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton.outlined(
                        onPressed: _newSpotsFound > 0 ? () => setState(() => _newSpotsFound--) : null,
                        icon: const Icon(Icons.remove),
                      ),
                      const SizedBox(width: 20),
                      Text('$_newSpotsFound', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
                      const SizedBox(width: 20),
                      IconButton.outlined(
                        onPressed: () => setState(() => _newSpotsFound++),
                        icon: const Icon(Icons.add),
                        style: IconButton.styleFrom(foregroundColor: const Color(0xFFE11D48)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _notesCtrl,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Notes (optional)',
              hintText: 'Any observations or concerns...',
              prefixIcon: Icon(Icons.note_outlined),
            ),
          ),
          const SizedBox(height: 80),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _SummaryRow({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 10),
          Text(label, style: const TextStyle(fontSize: 14)),
          const Spacer(),
          Text(value, style: TextStyle(fontWeight: FontWeight.w700, color: color)),
        ],
      ),
    );
  }
}
