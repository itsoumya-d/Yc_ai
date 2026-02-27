import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../../models/spot.dart';
import '../../providers/spots_provider.dart';
import '../../widgets/risk_badge.dart';

class SpotDetailScreen extends ConsumerStatefulWidget {
  final String spotId;
  const SpotDetailScreen({super.key, required this.spotId});

  @override
  ConsumerState<SpotDetailScreen> createState() => _SpotDetailScreenState();
}

class _SpotDetailScreenState extends ConsumerState<SpotDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _takeNewPhoto(SkinSpot spot) async {
    final XFile? file = await _picker.pickImage(source: ImageSource.camera, imageQuality: 90);
    if (file != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Analyzing photo with AI...'), duration: Duration(seconds: 2)),
      );
      await ref.read(spotsProvider.notifier).analyzeSpotPhoto(spot.id, File(file.path));
    }
  }

  void _showDermRecommendation(SkinSpot spot) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.local_hospital, color: Color(0xFFE11D48)),
                SizedBox(width: 10),
                Text('Dermatologist Recommendation', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 12),
            Text(spot.aiRiskLevel.recommendation, style: const TextStyle(fontSize: 15, height: 1.5)),
            const SizedBox(height: 16),
            const Text('When to visit:', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            ..._dermTips.map((tip) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.arrow_right, size: 18, color: Color(0xFFE11D48)),
                  const SizedBox(width: 4),
                  Expanded(child: Text(tip, style: const TextStyle(fontSize: 13))),
                ],
              ),
            )),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Got it'),
            ),
          ],
        ),
      ),
    );
  }

  static const List<String> _dermTips = [
    'Any spot that changes rapidly in size, color, or shape',
    'Spots with irregular borders or multiple colors',
    'Moles larger than 6mm (size of a pencil eraser)',
    'Any spot that bleeds, itches, or crusts persistently',
    'New spots appearing after age 40',
  ];

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(spotsProvider);
    final spot = state.spots.firstWhere((s) => s.id == widget.spotId, orElse: () => state.spots.first);
    final theme = Theme.of(context);
    final riskColor = Color(spot.aiRiskLevel.colorValue);

    return Scaffold(
      appBar: AppBar(
        title: Text(spot.name),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/spots'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.camera_alt_outlined),
            onPressed: () => _takeNewPhoto(spot),
            tooltip: 'Add Photo',
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFFE11D48),
          unselectedLabelColor: Colors.grey,
          indicatorColor: const Color(0xFFE11D48),
          tabs: const [Tab(text: 'Overview'), Tab(text: 'Photo History')],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Overview tab
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Risk card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: riskColor.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: riskColor.withOpacity(0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          RiskBadge(riskLevel: spot.aiRiskLevel),
                          const Spacer(),
                          TextButton(
                            onPressed: () => _showDermRecommendation(spot),
                            child: const Text('What should I do?'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(spot.aiRiskLevel.recommendation, style: const TextStyle(fontSize: 14, height: 1.4)),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Details
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Spot Details', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                        const SizedBox(height: 12),
                        _DetailRow('Location', _formatLocation(spot.locationOnBody)),
                        _DetailRow('First Detected', DateFormat('MMMM d, yyyy').format(spot.firstDetected)),
                        _DetailRow('Last Checked', spot.lastChecked != null ? DateFormat('MMMM d, yyyy').format(spot.lastChecked!) : 'Never'),
                        _DetailRow('Photos', '${spot.photos.length} taken'),
                        if (spot.notes != null) _DetailRow('Notes', spot.notes!),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // AI Analysis (latest)
                if (spot.photos.isNotEmpty && spot.photos.first.aiAnalysis != null) ...[
                  const Text('Latest AI Analysis', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF1F2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFDA4AF).withOpacity(0.5)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.auto_awesome, color: Color(0xFFE11D48), size: 16),
                            const SizedBox(width: 6),
                            Text(DateFormat('MMM d, yyyy').format(spot.photos.first.takenAt), style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                            if (spot.photos.first.changeDetected)
                              Container(
                                margin: const EdgeInsets.only(left: 8),
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(color: const Color(0xFFF97316), borderRadius: BorderRadius.circular(6)),
                                child: const Text('Change Detected', style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.w700)),
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(spot.photos.first.aiAnalysis!, style: const TextStyle(fontSize: 13, height: 1.5)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Actions
                ElevatedButton.icon(
                  onPressed: () => _takeNewPhoto(spot),
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Take New Photo'),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: () => _showDermRecommendation(spot),
                  icon: const Icon(Icons.local_hospital_outlined),
                  label: const Text('Dermatologist Guidance'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 52),
                    foregroundColor: const Color(0xFFE11D48),
                    side: const BorderSide(color: Color(0xFFE11D48)),
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),

          // Photo history tab
          spot.photos.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.photo_camera_outlined, size: 64, color: Colors.grey),
                      const SizedBox(height: 12),
                      const Text('No photos yet'),
                      const SizedBox(height: 8),
                      ElevatedButton.icon(
                        onPressed: () => _takeNewPhoto(spot),
                        icon: const Icon(Icons.camera_alt),
                        label: const Text('Take First Photo'),
                        style: ElevatedButton.styleFrom(minimumSize: const Size(180, 48)),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: spot.photos.length,
                  itemBuilder: (ctx, i) {
                    final photo = spot.photos[i];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.camera_alt_outlined, size: 16, color: Colors.grey),
                                const SizedBox(width: 6),
                                Text(DateFormat('MMMM d, yyyy').format(photo.takenAt), style: const TextStyle(fontWeight: FontWeight.w600)),
                                const Spacer(),
                                if (photo.changeDetected)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(color: const Color(0xFFF97316).withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                                    child: const Text('Change', style: TextStyle(fontSize: 11, color: Color(0xFFF97316), fontWeight: FontWeight.w700)),
                                  )
                                else
                                  const Icon(Icons.check_circle, size: 16, color: Color(0xFF22C55E)),
                              ],
                            ),
                            if (photo.localPath != null) ...[
                              const SizedBox(height: 8),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.file(File(photo.localPath!), height: 160, width: double.infinity, fit: BoxFit.cover),
                              ),
                            ],
                            if (photo.aiAnalysis != null) ...[
                              const SizedBox(height: 8),
                              Text(photo.aiAnalysis!, style: const TextStyle(fontSize: 13, height: 1.4, color: Colors.grey)),
                            ],
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ],
      ),
    );
  }

  String _formatLocation(String location) {
    return location.split('_').map((w) => w.isEmpty ? '' : w[0].toUpperCase() + w.substring(1)).join(' ');
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  const _DetailRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 110, child: Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13))),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }
}
