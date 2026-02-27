import 'package:flutter/material.dart';
import 'dart:math' as math;

class ComplianceGauge extends StatelessWidget {
  final double score;
  final double size;
  final bool showLabel;

  const ComplianceGauge({
    super.key,
    required this.score,
    this.size = 160,
    this.showLabel = true,
  });

  Color _scoreColor() {
    if (score >= 90) return Colors.green;
    if (score >= 75) return Colors.orange;
    if (score >= 60) return Colors.deepOrange;
    return Colors.red;
  }

  String _scoreLabel() {
    if (score >= 90) return 'Compliant';
    if (score >= 75) return 'Fair';
    if (score >= 60) return 'At Risk';
    return 'Non-Compliant';
  }

  @override
  Widget build(BuildContext context) {
    final color = _scoreColor();
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(size, size),
            painter: _GaugePainter(score: score, color: color),
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 20),
              Text(
                '${score.round()}%',
                style: TextStyle(
                  fontSize: size * 0.22,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              if (showLabel)
                Text(
                  _scoreLabel(),
                  style: TextStyle(
                    fontSize: size * 0.09,
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.w600,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _GaugePainter extends CustomPainter {
  final double score;
  final Color color;

  const _GaugePainter({required this.score, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 10;
    const startAngle = math.pi * 0.75;
    const sweepAngle = math.pi * 1.5;

    // Background arc
    final bgPaint = Paint()
      ..color = Colors.grey.shade200
      ..style = PaintingStyle.stroke
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      bgPaint,
    );

    // Score arc
    final scorePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle * (score / 100),
      false,
      scorePaint,
    );

    // Tick marks
    final tickPaint = Paint()
      ..color = Colors.grey.shade300
      ..strokeWidth = 1.5;
    for (int i = 0; i <= 10; i++) {
      final angle = startAngle + sweepAngle * i / 10;
      final tickInner = Offset(
        center.dx + (radius - 20) * math.cos(angle),
        center.dy + (radius - 20) * math.sin(angle),
      );
      final tickOuter = Offset(
        center.dx + (radius - 8) * math.cos(angle),
        center.dy + (radius - 8) * math.sin(angle),
      );
      canvas.drawLine(tickInner, tickOuter, tickPaint);
    }
  }

  @override
  bool shouldRepaint(_GaugePainter old) => old.score != score || old.color != color;
}
