import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class SectionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final bool isComplete;
  final int itemCount;
  final VoidCallback onTap;
  final Color? color;

  const SectionCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.isComplete,
    required this.itemCount,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final sectionColor = color ?? AppTheme.primaryTeal;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isComplete
                ? sectionColor.withOpacity(0.3)
                : const Color(0xFFE7E5E4),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: sectionColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: sectionColor, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    itemCount > 0 ? '$itemCount item${itemCount == 1 ? '' : 's'} added' : subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: itemCount > 0 ? sectionColor : const Color(0xFF78716C),
                    ),
                  ),
                ],
              ),
            ),
            Column(
              children: [
                if (isComplete)
                  Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: sectionColor,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check, size: 14, color: Colors.white),
                  )
                else
                  Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFD6D3D1), width: 2),
                    ),
                  ),
                const SizedBox(height: 4),
                const Icon(Icons.chevron_right, color: Color(0xFFD6D3D1), size: 20),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
