import 'package:flutter/material.dart';
import '../models/room.dart';

class RoomCard extends StatelessWidget {
  final Room room;
  final VoidCallback? onTap;

  const RoomCard({super.key, required this.room, this.onTap});

  Color _conditionColor() {
    switch (room.condition) {
      case RoomCondition.excellent:
        return Colors.green;
      case RoomCondition.good:
        return Colors.teal;
      case RoomCondition.fair:
        return Colors.orange;
      case RoomCondition.poor:
        return Colors.red;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: _conditionColor().withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(_roomIcon(room.name), color: _conditionColor(), size: 26),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(room.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text('${room.items.length} items', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                        if (room.issueCount > 0) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.red.shade50,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '${room.issueCount} issues',
                              style: TextStyle(color: Colors.red.shade700, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (room.isCompleted)
                    const Icon(Icons.check_circle, color: Colors.green, size: 20)
                  else
                    const Icon(Icons.radio_button_unchecked, color: Colors.grey, size: 20),
                  const SizedBox(height: 4),
                  Text(
                    room.condition.name.toUpperCase(),
                    style: TextStyle(color: _conditionColor(), fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _roomIcon(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('kitchen')) return Icons.kitchen_outlined;
    if (lower.contains('bath')) return Icons.bathtub_outlined;
    if (lower.contains('bed')) return Icons.bed_outlined;
    if (lower.contains('living')) return Icons.weekend_outlined;
    if (lower.contains('garage')) return Icons.garage_outlined;
    if (lower.contains('basement')) return Icons.foundation_outlined;
    if (lower.contains('roof')) return Icons.roofing_outlined;
    if (lower.contains('attic')) return Icons.roofing_outlined;
    return Icons.home_outlined;
  }
}
