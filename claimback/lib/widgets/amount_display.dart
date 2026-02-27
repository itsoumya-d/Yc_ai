import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AmountDisplay extends StatelessWidget {
  final double amount;
  final String? label;
  final Color? color;
  final double fontSize;
  final bool showSign;
  final bool recovered;

  const AmountDisplay({
    super.key,
    required this.amount,
    this.label,
    this.color,
    this.fontSize = 18,
    this.showSign = false,
    this.recovered = false,
  });

  @override
  Widget build(BuildContext context) {
    final displayColor = color ??
        (recovered ? AppTheme.successGreen : AppTheme.primaryOrange);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null)
          Text(
            label!,
            style: const TextStyle(
              fontSize: 11,
              color: Color(0xFF94A3B8),
              fontWeight: FontWeight.w500,
            ),
          ),
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            if (showSign && amount > 0)
              Text(
                '+',
                style: TextStyle(
                  fontSize: fontSize * 0.7,
                  fontWeight: FontWeight.bold,
                  color: displayColor,
                ),
              ),
            Text(
              '\$',
              style: TextStyle(
                fontSize: fontSize * 0.7,
                fontWeight: FontWeight.bold,
                color: displayColor,
              ),
            ),
            Text(
              amount.toStringAsFixed(2),
              style: TextStyle(
                fontSize: fontSize,
                fontWeight: FontWeight.bold,
                color: displayColor,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
