import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/planning_provider.dart';
import '../../models/digital_asset.dart';
import '../../theme/app_theme.dart';

class DigitalAssetsScreen extends ConsumerWidget {
  const DigitalAssetsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final planning = ref.watch(planningProvider);
    final assets = planning.digitalAssets;

    final grouped = <DigitalAssetCategory, List<DigitalAsset>>{};
    for (final asset in assets) {
      grouped.putIfAbsent(asset.category, () => []).add(asset);
    }

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(
        title: const Text('Digital Assets'),
        backgroundColor: const Color(0xFF7C3AED),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddAssetSheet(context, ref),
        backgroundColor: const Color(0xFF7C3AED),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Account', style: TextStyle(color: Colors.white)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF7C3AED).withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF7C3AED).withOpacity(0.2)),
            ),
            child: const Text(
              'Help your loved ones handle your online accounts. Never store actual passwords — use hints or a password manager reference.',
              style: TextStyle(fontSize: 12, color: Color(0xFF5B21B6), height: 1.5),
            ),
          ),
          const SizedBox(height: 16),
          if (assets.isEmpty)
            _EmptyView(onAdd: () => _showAddAssetSheet(context, ref))
          else
            ...DigitalAssetCategory.values
                .where((c) => grouped.containsKey(c))
                .map((cat) {
              final catAssets = grouped[cat]!;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Text(
                      cat.label,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.warmBrown,
                      ),
                    ),
                  ),
                  ...catAssets.map((asset) => _AssetCard(
                    asset: asset,
                    onDelete: () => ref.read(planningProvider.notifier).removeDigitalAsset(asset.id),
                  )),
                  const SizedBox(height: 8),
                ],
              );
            }),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  void _showAddAssetSheet(BuildContext context, WidgetRef ref) {
    final platformController = TextEditingController();
    final usernameController = TextEditingController();
    final hintController = TextEditingController();
    final instructionsController = TextEditingController();
    DigitalAssetCategory selectedCategory = DigitalAssetCategory.email;
    bool hasMonetaryValue = false;

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
                const Text('Add Digital Account', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                DropdownButtonFormField<DigitalAssetCategory>(
                  value: selectedCategory,
                  decoration: const InputDecoration(labelText: 'Category'),
                  onChanged: (v) => setState(() => selectedCategory = v!),
                  items: DigitalAssetCategory.values.map((c) {
                    return DropdownMenuItem(value: c, child: Text(c.label));
                  }).toList(),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: platformController,
                  decoration: const InputDecoration(labelText: 'Platform (e.g., Gmail, Facebook)'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: usernameController,
                  decoration: const InputDecoration(labelText: 'Username / Email'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: hintController,
                  decoration: const InputDecoration(
                    labelText: 'Password Hint (not actual password)',
                    hintText: 'e.g., "Check password manager under Google"',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: instructionsController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Instructions for Loved Ones',
                    hintText: 'What should they do with this account?',
                  ),
                ),
                const SizedBox(height: 8),
                SwitchListTile(
                  value: hasMonetaryValue,
                  onChanged: (v) => setState(() => hasMonetaryValue = v),
                  title: const Text('Has monetary value', style: TextStyle(fontSize: 14)),
                  contentPadding: EdgeInsets.zero,
                  activeColor: AppTheme.primaryTeal,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    if (platformController.text.isEmpty) return;
                    ref.read(planningProvider.notifier).addDigitalAsset(
                      DigitalAsset(
                        id: DateTime.now().millisecondsSinceEpoch.toString(),
                        platform: platformController.text,
                        username: usernameController.text,
                        passwordHint: hintController.text.isEmpty ? null : hintController.text,
                        instructions: instructionsController.text,
                        category: selectedCategory,
                        hasMonetaryValue: hasMonetaryValue,
                      ),
                    );
                    Navigator.pop(context);
                  },
                  child: const Text('Add Account'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AssetCard extends StatelessWidget {
  final DigitalAsset asset;
  final VoidCallback onDelete;

  const _AssetCard({required this.asset, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE7E5E4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFF7C3AED).withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.devices_outlined, color: Color(0xFF7C3AED), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(asset.platform, style: const TextStyle(fontWeight: FontWeight.w600)),
                    if (asset.hasMonetaryValue) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.amber.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Value',
                          style: TextStyle(fontSize: 10, color: Colors.amber, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(asset.username, style: const TextStyle(fontSize: 12, color: AppTheme.warmBrown)),
                if (asset.instructions.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    asset.instructions,
                    style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
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

class _EmptyView extends StatelessWidget {
  final VoidCallback onAdd;

  const _EmptyView({required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 40),
          const Icon(Icons.devices_outlined, size: 72, color: Color(0xFFD6D3D1)),
          const SizedBox(height: 16),
          const Text('No digital accounts added', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          const Text(
            'Add your online accounts so loved ones\ncan handle them after you\'re gone',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppTheme.warmBrown),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add),
            label: const Text('Add Account'),
            style: ElevatedButton.styleFrom(minimumSize: const Size(200, 48)),
          ),
        ],
      ),
    );
  }
}
