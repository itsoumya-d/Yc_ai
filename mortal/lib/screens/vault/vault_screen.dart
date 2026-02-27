import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/planning_provider.dart';
import '../../theme/app_theme.dart';

class VaultScreen extends ConsumerWidget {
  const VaultScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final planning = ref.watch(planningProvider);
    final documents = planning.vaultDocuments;

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(
        title: const Text('Document Vault'),
        backgroundColor: const Color(0xFF64748B),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddDocumentSheet(context, ref),
        backgroundColor: const Color(0xFF64748B),
        icon: const Icon(Icons.upload_file, color: Colors.white),
        label: const Text('Add Document', style: TextStyle(color: Colors.white)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF64748B).withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF64748B).withOpacity(0.2)),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.security, color: Color(0xFF64748B), size: 18),
                    SizedBox(width: 8),
                    Text(
                      'Secure Document Storage',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ],
                ),
                SizedBox(height: 6),
                Text(
                  'Store references to important documents. In production, files are encrypted end-to-end.',
                  style: TextStyle(fontSize: 12, color: Color(0xFF475569), height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Suggested Documents',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.warmBrown),
          ),
          const SizedBox(height: 10),
          ..._suggestedDocs.map((doc) {
            final isAdded = documents.contains(doc['name']);
            return _DocumentSuggestionTile(
              name: doc['name']!,
              icon: doc['icon']!,
              isAdded: isAdded,
              onAdd: isAdded
                  ? null
                  : () => ref.read(planningProvider.notifier).addVaultDocument(doc['name']!),
            );
          }),
          if (documents.isNotEmpty) ...[
            const SizedBox(height: 20),
            const Text(
              'Your Documents',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.warmBrown),
            ),
            const SizedBox(height: 10),
            ...documents.map((doc) => _DocumentTile(
              name: doc,
              onDelete: () => ref.read(planningProvider.notifier).removeVaultDocument(doc),
            )),
          ],
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  static const _suggestedDocs = [
    {'name': 'birth_certificate.pdf', 'icon': 'birth'},
    {'name': 'passport_scan.pdf', 'icon': 'passport'},
    {'name': 'marriage_certificate.pdf', 'icon': 'marriage'},
    {'name': 'will_document.pdf', 'icon': 'will'},
    {'name': 'insurance_policy.pdf', 'icon': 'insurance'},
    {'name': 'property_deed.pdf', 'icon': 'property'},
    {'name': 'tax_returns.pdf', 'icon': 'tax'},
    {'name': 'bank_statements.pdf', 'icon': 'bank'},
  ];

  void _showAddDocumentSheet(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Document Reference'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Enter a name for the document you want to track.'),
            const SizedBox(height: 12),
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Document name (e.g., will_document.pdf)',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (nameController.text.isNotEmpty) {
                ref.read(planningProvider.notifier).addVaultDocument(nameController.text);
                Navigator.pop(context);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }
}

class _DocumentSuggestionTile extends StatelessWidget {
  final String name;
  final String icon;
  final bool isAdded;
  final VoidCallback? onAdd;

  const _DocumentSuggestionTile({
    required this.name,
    required this.icon,
    required this.isAdded,
    this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: isAdded ? AppTheme.primaryTeal.withOpacity(0.05) : Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isAdded ? AppTheme.primaryTeal.withOpacity(0.3) : const Color(0xFFE7E5E4),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.description_outlined,
            color: isAdded ? AppTheme.primaryTeal : const Color(0xFF94A3B8),
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              name,
              style: TextStyle(
                fontSize: 13,
                color: isAdded ? AppTheme.darkTeal : const Color(0xFF1E293B),
              ),
            ),
          ),
          if (isAdded)
            const Icon(Icons.check_circle, color: AppTheme.primaryTeal, size: 18)
          else if (onAdd != null)
            TextButton(
              onPressed: onAdd,
              child: const Text('Add'),
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xFF64748B),
                minimumSize: Size.zero,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              ),
            ),
        ],
      ),
    );
  }
}

class _DocumentTile extends StatelessWidget {
  final String name;
  final VoidCallback onDelete;

  const _DocumentTile({required this.name, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE7E5E4)),
      ),
      child: Row(
        children: [
          const Icon(Icons.insert_drive_file_outlined, color: Color(0xFF64748B), size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(name, style: const TextStyle(fontSize: 13)),
          ),
          GestureDetector(
            onTap: onDelete,
            child: const Icon(Icons.delete_outline, color: Color(0xFFEF4444), size: 20),
          ),
        ],
      ),
    );
  }
}
