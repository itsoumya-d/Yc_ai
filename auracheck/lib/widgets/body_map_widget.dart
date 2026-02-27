import 'package:flutter/material.dart';

class BodyMapWidget extends StatefulWidget {
  final Map<String, bool> checkedRegions;
  final Function(String region) onRegionTapped;
  final Map<String, Color>? regionColors;

  const BodyMapWidget({
    super.key,
    required this.checkedRegions,
    required this.onRegionTapped,
    this.regionColors,
  });

  @override
  State<BodyMapWidget> createState() => _BodyMapWidgetState();
}

class _BodyMapWidgetState extends State<BodyMapWidget> {
  static const _regions = [
    _Region('face', 'Face', Rect.fromLTWH(70, 2, 60, 50)),
    _Region('neck', 'Neck', Rect.fromLTWH(80, 52, 40, 25)),
    _Region('chest', 'Chest', Rect.fromLTWH(55, 77, 90, 60)),
    _Region('abdomen', 'Abdomen', Rect.fromLTWH(60, 137, 80, 55)),
    _Region('left_shoulder', 'L. Shoulder', Rect.fromLTWH(10, 77, 45, 45)),
    _Region('right_shoulder', 'R. Shoulder', Rect.fromLTWH(145, 77, 45, 45)),
    _Region('left_arm', 'Left Arm', Rect.fromLTWH(5, 122, 40, 80)),
    _Region('right_arm', 'Right Arm', Rect.fromLTWH(155, 122, 40, 80)),
    _Region('upper_back', 'Upper Back', Rect.fromLTWH(60, 77, 80, 55)),
    _Region('lower_back', 'Lower Back', Rect.fromLTWH(60, 132, 80, 50)),
    _Region('left_leg', 'Left Leg', Rect.fromLTWH(55, 192, 45, 110)),
    _Region('right_leg', 'Right Leg', Rect.fromLTWH(100, 192, 45, 110)),
    _Region('left_foot', 'Left Foot', Rect.fromLTWH(50, 302, 50, 30)),
    _Region('right_foot', 'Right Foot', Rect.fromLTWH(100, 302, 50, 30)),
  ];

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final scale = constraints.maxWidth / 200;
        return SizedBox(
          height: 340 * scale,
          child: Stack(
            children: [
              // Body silhouette (simplified oval shapes)
              CustomPaint(
                size: Size(200 * scale, 340 * scale),
                painter: _BodyPainter(scale: scale),
              ),
              // Tappable region overlays
              ..._regions.map((region) {
                final isChecked = widget.checkedRegions[region.id] ?? false;
                final customColor = widget.regionColors?[region.id];
                final color = customColor ?? (isChecked ? const Color(0xFFE11D48) : Colors.transparent);

                return Positioned(
                  left: region.rect.left * scale,
                  top: region.rect.top * scale,
                  width: region.rect.width * scale,
                  height: region.rect.height * scale,
                  child: GestureDetector(
                    onTap: () => widget.onRegionTapped(region.id),
                    child: Tooltip(
                      message: region.label,
                      child: Container(
                        decoration: BoxDecoration(
                          color: color.withOpacity(isChecked ? 0.35 : 0.0),
                          borderRadius: BorderRadius.circular(8 * scale),
                          border: Border.all(
                            color: isChecked ? const Color(0xFFE11D48) : Colors.transparent,
                            width: 1.5,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: isChecked
                            ? Icon(Icons.check_circle, size: 14 * scale, color: const Color(0xFFE11D48))
                            : null,
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }
}

class _BodyPainter extends CustomPainter {
  final double scale;
  const _BodyPainter({required this.scale});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFFECDD3)
      ..style = PaintingStyle.fill;
    final borderPaint = Paint()
      ..color = const Color(0xFFFDA4AF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    final s = scale;

    // Head
    canvas.drawOval(Rect.fromLTWH(70 * s, 2 * s, 60 * s, 55 * s), paint);
    canvas.drawOval(Rect.fromLTWH(70 * s, 2 * s, 60 * s, 55 * s), borderPaint);

    // Neck
    canvas.drawRect(Rect.fromLTWH(85 * s, 52 * s, 30 * s, 25 * s), paint);

    // Torso
    final torsoPath = Path()
      ..moveTo(50 * s, 77 * s)
      ..lineTo(150 * s, 77 * s)
      ..lineTo(155 * s, 195 * s)
      ..lineTo(45 * s, 195 * s)
      ..close();
    canvas.drawPath(torsoPath, paint);
    canvas.drawPath(torsoPath, borderPaint);

    // Left arm
    final leftArmPath = Path()
      ..moveTo(50 * s, 77 * s)
      ..lineTo(15 * s, 85 * s)
      ..lineTo(10 * s, 200 * s)
      ..lineTo(35 * s, 202 * s)
      ..lineTo(48 * s, 100 * s)
      ..close();
    canvas.drawPath(leftArmPath, paint);
    canvas.drawPath(leftArmPath, borderPaint);

    // Right arm
    final rightArmPath = Path()
      ..moveTo(150 * s, 77 * s)
      ..lineTo(185 * s, 85 * s)
      ..lineTo(190 * s, 200 * s)
      ..lineTo(165 * s, 202 * s)
      ..lineTo(152 * s, 100 * s)
      ..close();
    canvas.drawPath(rightArmPath, paint);
    canvas.drawPath(rightArmPath, borderPaint);

    // Left leg
    final leftLegPath = Path()
      ..moveTo(45 * s, 195 * s)
      ..lineTo(100 * s, 195 * s)
      ..lineTo(100 * s, 320 * s)
      ..lineTo(48 * s, 320 * s)
      ..close();
    canvas.drawPath(leftLegPath, paint);
    canvas.drawPath(leftLegPath, borderPaint);

    // Right leg
    final rightLegPath = Path()
      ..moveTo(100 * s, 195 * s)
      ..lineTo(155 * s, 195 * s)
      ..lineTo(152 * s, 320 * s)
      ..lineTo(100 * s, 320 * s)
      ..close();
    canvas.drawPath(rightLegPath, paint);
    canvas.drawPath(rightLegPath, borderPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _Region {
  final String id;
  final String label;
  final Rect rect;
  const _Region(this.id, this.label, this.rect);
}
