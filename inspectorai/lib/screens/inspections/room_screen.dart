import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';
import '../../models/inspection.dart';
import '../../models/room.dart';
import '../../models/inspection_item.dart';
import '../../providers/inspections_provider.dart';
import '../../widgets/item_condition_selector.dart';
import '../../widgets/severity_badge.dart';
import '../../widgets/photo_capture_widget.dart';

class RoomScreen extends ConsumerStatefulWidget {
  final String inspectionId;
  final String roomId;
  const RoomScreen({super.key, required this.inspectionId, required this.roomId});

  @override
  ConsumerState<RoomScreen> createState() => _RoomScreenState();
}

class _RoomScreenState extends ConsumerState<RoomScreen> {
  final List<String> _categories = ['Windows', 'Doors', 'Walls', 'Ceiling', 'Floor', 'Electrical', 'Plumbing', 'HVAC', 'Other'];
  int _selectedCategoryIndex = 0;
  bool _isSaving = false;

  final Map<String, List<String>> _itemsByCategory = {
    'Windows': ['Window operation', 'Seals and weather stripping', 'Glass condition', 'Screens'],
    'Doors': ['Door operation', 'Locks and hardware', 'Frame condition', 'Weatherstripping'],
    'Walls': ['Paint and finish', 'Cracks or damage', 'Moisture/stains', 'Insulation'],
    'Ceiling': ['Paint and finish', 'Water stains', 'Cracks', 'Fixtures'],
    'Floor': ['Finish condition', 'Squeaks or damage', 'Transitions', 'Subfloor'],
    'Electrical': ['Outlets and switches', 'GFCI protection', 'Panel/circuit breakers', 'Lighting'],
    'Plumbing': ['Fixtures', 'Under-sink plumbing', 'Water pressure', 'Drainage'],
    'HVAC': ['Vents and registers', 'Thermostat', 'Filters', 'Unit condition'],
    'Other': ['General condition', 'Safety hazards', 'Deferred maintenance'],
  };

  late Map<String, ItemCondition> _itemConditions;
  late Map<String, ItemSeverity?> _itemSeverities;
  late Map<String, List<String>> _itemPhotos;
  late Map<String, String> _itemRecommendations;
  Room? _room;

  @override
  void initState() {
    super.initState();
    _itemConditions = {};
    _itemSeverities = {};
    _itemPhotos = {};
    _itemRecommendations = {};
  }

  Room? _getRoom() {
    final inspections = ref.read(inspectionsProvider).value;
    final inspection = inspections?.where((i) => i.id == widget.inspectionId).firstOrNull;
    return inspection?.rooms.where((r) => r.id == widget.roomId).firstOrNull;
  }

  @override
  Widget build(BuildContext context) {
    final inspections = ref.watch(inspectionsProvider);
    final inspection = inspections.value?.where((i) => i.id == widget.inspectionId).firstOrNull;
    final room = inspection?.rooms.where((r) => r.id == widget.roomId).firstOrNull;

    if (room == null) return const Scaffold(body: Center(child: Text('Room not found')));

    _room = room;
    final category = _categories[_selectedCategoryIndex];
    final categoryItems = _itemsByCategory[category] ?? [];

    return Scaffold(
      appBar: AppBar(
        title: Text(room.name),
        leading: const BackButton(color: Colors.white),
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _saveRoom,
            child: _isSaving
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Save', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
      body: Column(
        children: [
          // Category tabs
          SizedBox(
            height: 44,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final isSelected = _selectedCategoryIndex == index;
                return GestureDetector(
                  onTap: () => setState(() => _selectedCategoryIndex = index),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _categories[index],
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.grey.shade700,
                        fontWeight: isSelected ? FontWeight.bold : null,
                        fontSize: 13,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          // Items
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(12),
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemCount: categoryItems.length,
              itemBuilder: (context, index) {
                final itemKey = '$category-${categoryItems[index]}';
                return _InspectionItemTile(
                  label: categoryItems[index],
                  condition: _itemConditions[itemKey],
                  severity: _itemSeverities[itemKey],
                  photos: _itemPhotos[itemKey] ?? [],
                  recommendation: _itemRecommendations[itemKey] ?? '',
                  onConditionChanged: (c) => setState(() {
                    _itemConditions[itemKey] = c;
                    if (c == ItemCondition.good) _itemSeverities[itemKey] = null;
                  }),
                  onSeverityChanged: (s) => setState(() => _itemSeverities[itemKey] = s),
                  onPhotosChanged: (p) => setState(() => _itemPhotos[itemKey] = p),
                  onRecommendationChanged: (r) => setState(() => _itemRecommendations[itemKey] = r),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _isSaving ? null : () async {
          await _saveRoom();
          if (mounted) context.pop();
        },
        icon: const Icon(Icons.check),
        label: const Text('Done'),
      ),
    );
  }

  Future<void> _saveRoom() async {
    setState(() => _isSaving = true);
    try {
      final room = _getRoom();
      if (room == null) return;

      final items = <InspectionItem>[];
      for (final category in _categories) {
        final categoryItems = _itemsByCategory[category] ?? [];
        for (final itemName in categoryItems) {
          final key = '$category-$itemName';
          final condition = _itemConditions[key];
          if (condition != null) {
            items.add(InspectionItem(
              id: const Uuid().v4(),
              roomId: widget.roomId,
              category: category,
              description: itemName,
              condition: condition,
              severity: _itemSeverities[key],
              photos: _itemPhotos[key] ?? [],
              recommendation: _itemRecommendations[key] ?? '',
            ));
          }
        }
      }

      final updatedRoom = room.copyWith(
        items: items,
        isCompleted: items.isNotEmpty,
        condition: _calculateCondition(items),
      );

      await ref.read(inspectionsProvider.notifier).updateRoom(widget.inspectionId, updatedRoom);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Room inspection saved!'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  RoomCondition _calculateCondition(List<InspectionItem> items) {
    if (items.isEmpty) return RoomCondition.good;
    final hasDeficient = items.any((i) => i.condition == ItemCondition.deficient);
    final hasPoor = items.any((i) => i.condition == ItemCondition.poor);
    final hasFair = items.any((i) => i.condition == ItemCondition.fair);
    if (hasDeficient) return RoomCondition.poor;
    if (hasPoor) return RoomCondition.fair;
    if (hasFair) return RoomCondition.fair;
    return RoomCondition.good;
  }
}

class _InspectionItemTile extends StatefulWidget {
  final String label;
  final ItemCondition? condition;
  final ItemSeverity? severity;
  final List<String> photos;
  final String recommendation;
  final ValueChanged<ItemCondition> onConditionChanged;
  final ValueChanged<ItemSeverity?> onSeverityChanged;
  final ValueChanged<List<String>> onPhotosChanged;
  final ValueChanged<String> onRecommendationChanged;

  const _InspectionItemTile({
    required this.label,
    this.condition,
    this.severity,
    required this.photos,
    required this.recommendation,
    required this.onConditionChanged,
    required this.onSeverityChanged,
    required this.onPhotosChanged,
    required this.onRecommendationChanged,
  });

  @override
  State<_InspectionItemTile> createState() => _InspectionItemTileState();
}

class _InspectionItemTileState extends State<_InspectionItemTile> {
  bool _expanded = false;
  late TextEditingController _recommendationController;

  @override
  void initState() {
    super.initState();
    _recommendationController = TextEditingController(text: widget.recommendation);
  }

  @override
  void dispose() {
    _recommendationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hasIssue = widget.condition == ItemCondition.poor || widget.condition == ItemCondition.deficient;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(widget.label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
              ),
              if (widget.severity != null) ...[
                SeverityBadge(severity: widget.severity!),
                const SizedBox(width: 8),
              ],
              GestureDetector(
                onTap: () => setState(() => _expanded = !_expanded),
                child: Icon(
                  _expanded ? Icons.expand_less : Icons.expand_more,
                  color: Colors.grey,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ItemConditionSelector(
            selected: widget.condition,
            onChanged: (c) {
              widget.onConditionChanged(c);
              if (c != ItemCondition.good) setState(() => _expanded = true);
            },
          ),
          if (_expanded || hasIssue) ...[
            const SizedBox(height: 10),
            if (hasIssue) ...[
              const Text('Severity', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
              const SizedBox(height: 6),
              Wrap(
                spacing: 6,
                children: ItemSeverity.values.map((s) {
                  final isSelected = widget.severity == s;
                  return GestureDetector(
                    onTap: () => widget.onSeverityChanged(isSelected ? null : s),
                    child: SeverityBadge(severity: s),
                  );
                }).toList(),
              ),
              const SizedBox(height: 10),
            ],
            PhotoCaptureWidget(
              photos: widget.photos,
              onPhotosChanged: widget.onPhotosChanged,
              maxPhotos: 5,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _recommendationController,
              maxLines: 2,
              onChanged: widget.onRecommendationChanged,
              decoration: const InputDecoration(
                hintText: 'Inspector notes or recommendation...',
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                isDense: true,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
