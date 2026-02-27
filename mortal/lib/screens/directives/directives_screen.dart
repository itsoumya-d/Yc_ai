import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/planning_provider.dart';
import '../../models/directive.dart';
import '../../theme/app_theme.dart';

class DirectivesScreen extends ConsumerWidget {
  const DirectivesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final planning = ref.watch(planningProvider);
    final directives = planning.directives;

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(
        title: const Text('Healthcare Directives'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddDirectiveSheet(context, ref),
        backgroundColor: const Color(0xFF0891B2),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Directive', style: TextStyle(color: Colors.white)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF0891B2).withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF0891B2).withOpacity(0.2)),
            ),
            child: const Text(
              'Advance directives ensure your medical wishes are respected if you cannot communicate them yourself.',
              style: TextStyle(fontSize: 13, color: Color(0xFF0E7490), height: 1.5),
            ),
          ),
          const SizedBox(height: 16),
          if (directives.isEmpty)
            _EmptyView(onAdd: () => _showAddDirectiveSheet(context, ref))
          else
            ...directives.map((directive) => _DirectiveCard(
              directive: directive,
              onDelete: () => ref.read(planningProvider.notifier).removeDirective(directive.id),
            )),
          const SizedBox(height: 16),
          const Text(
            'Directive Types',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          ...DirectiveType.values.map((type) {
            final hasDirective = directives.any((d) => d.type == type);
            return _DirectiveTypeTile(
              type: type,
              hasDirective: hasDirective,
              onAdd: () => _showAddDirectiveSheet(context, ref, preselectedType: type),
            );
          }),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  void _showAddDirectiveSheet(BuildContext context, WidgetRef ref, {DirectiveType? preselectedType}) {
    DirectiveType selectedType = preselectedType ?? DirectiveType.healthcareProxy;
    final contentController = TextEditingController();
    final attorneyController = TextEditingController();
    bool isSigned = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Add Directive', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                DropdownButtonFormField<DirectiveType>(
                  value: selectedType,
                  decoration: const InputDecoration(labelText: 'Type'),
                  onChanged: (v) => setState(() => selectedType = v!),
                  items: DirectiveType.values.map((t) {
                    return DropdownMenuItem(value: t, child: Text(t.label));
                  }).toList(),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: contentController,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    labelText: 'Details / Instructions',
                    hintText: 'Describe your wishes...',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: attorneyController,
                  decoration: const InputDecoration(labelText: "Attorney's Name (if applicable)"),
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  value: isSigned,
                  onChanged: (v) => setState(() => isSigned = v),
                  title: const Text('Document has been signed'),
                  contentPadding: EdgeInsets.zero,
                  activeColor: AppTheme.primaryTeal,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    if (contentController.text.isEmpty) return;
                    ref.read(planningProvider.notifier).addDirective(
                      AdvanceDirective(
                        id: DateTime.now().millisecondsSinceEpoch.toString(),
                        type: selectedType,
                        content: contentController.text,
                        signed: isSigned,
                        attorneyName: attorneyController.text.isEmpty ? null : attorneyController.text,
                        signedDate: isSigned ? DateTime.now() : null,
                      ),
                    );
                    Navigator.pop(context);
                  },
                  child: const Text('Add Directive'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DirectiveCard extends StatelessWidget {
  final AdvanceDirective directive;
  final VoidCallback onDelete;

  const _DirectiveCard({required this.directive, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE7E5E4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  directive.type.label,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: directive.signed
                      ? AppTheme.successGreen.withOpacity(0.1)
                      : Colors.orange.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  directive.signed ? 'Signed' : 'Draft',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: directive.signed ? AppTheme.successGreen : Colors.orange,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: onDelete,
                child: const Icon(Icons.delete_outline, color: Color(0xFFEF4444), size: 20),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            directive.content,
            style: const TextStyle(fontSize: 13, color: AppTheme.warmBrown, height: 1.4),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
          if (directive.attorneyName != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.gavel, size: 13, color: AppTheme.warmBrown),
                const SizedBox(width: 4),
                Text(
                  directive.attorneyName!,
                  style: const TextStyle(fontSize: 12, color: AppTheme.warmBrown),
                ),
              ],
            ),
          ],
          if (directive.signedDate != null) ...[
            const SizedBox(height: 4),
            Text(
              'Signed ${DateFormat('MMMM d, yyyy').format(directive.signedDate!)}',
              style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
            ),
          ],
        ],
      ),
    );
  }
}

class _DirectiveTypeTile extends StatelessWidget {
  final DirectiveType type;
  final bool hasDirective;
  final VoidCallback onAdd;

  const _DirectiveTypeTile({
    required this.type,
    required this.hasDirective,
    required this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: hasDirective ? AppTheme.primaryTeal.withOpacity(0.05) : Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: hasDirective ? AppTheme.primaryTeal.withOpacity(0.3) : const Color(0xFFE7E5E4),
        ),
      ),
      child: Row(
        children: [
          Icon(
            hasDirective ? Icons.check_circle : Icons.radio_button_unchecked,
            color: hasDirective ? AppTheme.primaryTeal : const Color(0xFFD6D3D1),
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(type.label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                Text(type.description, style: const TextStyle(fontSize: 12, color: AppTheme.warmBrown)),
              ],
            ),
          ),
          if (!hasDirective)
            TextButton(
              onPressed: onAdd,
              child: const Text('Add'),
            ),
        ],
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  final VoidCallback onAdd;

  const _EmptyView({required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      alignment: Alignment.center,
      child: Column(
        children: [
          const Icon(Icons.local_hospital_outlined, size: 60, color: Color(0xFFD6D3D1)),
          const SizedBox(height: 12),
          const Text('No directives added yet', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          const Text(
            'Add your healthcare preferences\nand legal documents',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppTheme.warmBrown, fontSize: 13),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: onAdd,
            style: ElevatedButton.styleFrom(minimumSize: const Size(160, 44)),
            child: const Text('Add Directive'),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
