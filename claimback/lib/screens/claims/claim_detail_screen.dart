import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../providers/claims_provider.dart';
import '../../models/claim.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/amount_display.dart';
import '../../theme/app_theme.dart';

class ClaimDetailScreen extends ConsumerWidget {
  final String claimId;

  const ClaimDetailScreen({super.key, required this.claimId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final claim = ref.watch(claimByIdProvider(claimId));

    if (claim == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Claim Not Found')),
        body: const Center(child: Text('Claim not found')),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(claim.company),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/claims'),
        ),
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'update') _showUpdateStatusDialog(context, ref, claim);
              if (value == 'delete') {
                ref.read(claimsProvider.notifier).deleteClaim(claim.id);
                context.go('/claims');
              }
            },
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'update', child: Text('Update Status')),
              const PopupMenuItem(value: 'delete', child: Text('Delete Claim')),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      StatusBadge(status: claim.status),
                      Text(
                        DateFormat('MMM d, yyyy').format(claim.createdAt),
                        style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    claim.company,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    claim.type.label,
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      AmountDisplay(amount: claim.amount, label: 'Claimed', fontSize: 24),
                      if (claim.recoveredAmount != null) ...[
                        const SizedBox(width: 24),
                        AmountDisplay(
                          amount: claim.recoveredAmount!,
                          label: 'Recovered',
                          fontSize: 24,
                          recovered: true,
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _SectionCard(
              title: 'Issue Description',
              child: Text(
                claim.description,
                style: const TextStyle(fontSize: 14, color: Color(0xFF475569), height: 1.6),
              ),
            ),
            if (claim.generatedLetter != null) ...[
              const SizedBox(height: 12),
              _SectionCard(
                title: 'Dispute Letter',
                action: IconButton(
                  icon: const Icon(Icons.copy, size: 18),
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: claim.generatedLetter!));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Letter copied to clipboard')),
                    );
                  },
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.successGreen.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.auto_awesome, size: 13, color: AppTheme.successGreen),
                          SizedBox(width: 4),
                          Text(
                            'AI Generated',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppTheme.successGreen,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      claim.generatedLetter!,
                      style: const TextStyle(
                        fontSize: 12,
                        height: 1.7,
                        fontFamily: 'monospace',
                        color: Color(0xFF374151),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            if (claim.evidenceUrls.isNotEmpty) ...[
              const SizedBox(height: 12),
              _SectionCard(
                title: 'Evidence (${claim.evidenceUrls.length})',
                child: Column(
                  children: claim.evidenceUrls.map((url) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          const Icon(Icons.attach_file, size: 16, color: Color(0xFF64748B)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              url,
                              style: const TextStyle(fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
            if (claim.resolution != null) ...[
              const SizedBox(height: 12),
              _SectionCard(
                title: 'Resolution',
                child: Text(
                  claim.resolution!,
                  style: const TextStyle(fontSize: 14, color: Color(0xFF475569), height: 1.5),
                ),
              ),
            ],
            const SizedBox(height: 24),
            if (claim.status == ClaimStatus.filed || claim.status == ClaimStatus.pending)
              OutlinedButton.icon(
                onPressed: () => _showUpdateStatusDialog(context, ref, claim),
                icon: const Icon(Icons.update),
                label: const Text('Update Status'),
              ),
          ],
        ),
      ),
    );
  }

  void _showUpdateStatusDialog(BuildContext context, WidgetRef ref, Claim claim) {
    ClaimStatus selected = claim.status;
    final resolutionController = TextEditingController();
    final recoveredController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Update Claim Status'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<ClaimStatus>(
                value: selected,
                onChanged: (v) => setState(() => selected = v!),
                items: ClaimStatus.values.map((s) {
                  return DropdownMenuItem(value: s, child: Text(s.label));
                }).toList(),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: resolutionController,
                decoration: const InputDecoration(labelText: 'Resolution Note (optional)'),
              ),
              if (selected == ClaimStatus.won || selected == ClaimStatus.settled) ...[
                const SizedBox(height: 12),
                TextField(
                  controller: recoveredController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Amount Recovered',
                    prefixText: '\$',
                  ),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                ref.read(claimsProvider.notifier).updateClaimStatus(
                  claim.id,
                  selected,
                  resolution: resolutionController.text.isEmpty ? null : resolutionController.text,
                  recoveredAmount: double.tryParse(recoveredController.text),
                );
                Navigator.pop(context);
              },
              child: const Text('Update'),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;
  final Widget? action;

  const _SectionCard({
    required this.title,
    required this.child,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              if (action != null) action!,
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}
