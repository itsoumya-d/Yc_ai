import 'package:flutter/material.dart';
import '../models/checklist_item.dart';

class ChecklistItemTile extends StatelessWidget {
  final ChecklistItem item;
  final ValueChanged<bool?> onChanged;
  final VoidCallback? onAddNote;
  final VoidCallback? onAddPhoto;

  const ChecklistItemTile({
    super.key,
    required this.item,
    required this.onChanged,
    this.onAddNote,
    this.onAddPhoto,
  });

  @override
  Widget build(BuildContext context) {
    final isCompliant = item.isCompliant;
    final isViolation = isCompliant == false;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      decoration: BoxDecoration(
        color: isViolation
            ? Colors.red.shade50
            : isCompliant == true
                ? Colors.green.shade50
                : Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isViolation
              ? Colors.red.shade200
              : isCompliant == true
                  ? Colors.green.shade200
                  : Colors.grey.shade200,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.category,
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.grey.shade600,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(item.description, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    ],
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _ComplianceButton(
                      label: 'Pass',
                      icon: Icons.check,
                      color: Colors.green,
                      isSelected: isCompliant == true,
                      onTap: () => onChanged(true),
                    ),
                    const SizedBox(width: 6),
                    _ComplianceButton(
                      label: 'Fail',
                      icon: Icons.close,
                      color: Colors.red,
                      isSelected: isCompliant == false,
                      onTap: () => onChanged(false),
                    ),
                  ],
                ),
              ],
            ),
            if (item.notes.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(item.notes, style: const TextStyle(color: Colors.grey, fontSize: 12, fontStyle: FontStyle.italic)),
            ],
            if (isViolation) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  if (onAddNote != null)
                    TextButton.icon(
                      onPressed: onAddNote,
                      icon: const Icon(Icons.note_add_outlined, size: 16),
                      label: const Text('Add Note'),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        minimumSize: Size.zero,
                        foregroundColor: Colors.red,
                      ),
                    ),
                  if (onAddPhoto != null)
                    TextButton.icon(
                      onPressed: onAddPhoto,
                      icon: const Icon(Icons.camera_alt_outlined, size: 16),
                      label: const Text('Photo'),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        minimumSize: Size.zero,
                        foregroundColor: Colors.red,
                      ),
                    ),
                  if (item.photos.isNotEmpty) ...[
                    const SizedBox(width: 4),
                    Icon(Icons.photo_library_outlined, size: 14, color: Colors.grey.shade600),
                    Text(' ${item.photos.length}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                  ],
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ComplianceButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final bool isSelected;
  final VoidCallback onTap;

  const _ComplianceButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? color : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSelected ? color : Colors.grey.shade300),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: isSelected ? Colors.white : Colors.grey),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: isSelected ? Colors.white : Colors.grey,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
