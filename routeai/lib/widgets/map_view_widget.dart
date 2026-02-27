import 'package:flutter/material.dart';
import '../models/job.dart';

/// Map view widget for route visualization
/// Uses google_maps_flutter when API key is available; shows placeholder otherwise
class MapViewWidget extends StatelessWidget {
  final List<Job> jobs;
  final double? currentLat;
  final double? currentLng;
  final double height;

  const MapViewWidget({
    super.key,
    required this.jobs,
    this.currentLat,
    this.currentLng,
    this.height = 300,
  });

  @override
  Widget build(BuildContext context) {
    // Map placeholder - in production, use google_maps_flutter with actual key
    return Container(
      height: height,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.teal.shade50, Colors.cyan.shade50],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.teal.shade200),
      ),
      child: Stack(
        children: [
          // Grid lines (map feel)
          CustomPaint(
            size: Size.infinite,
            painter: _MapGridPainter(),
          ),
          // Job markers
          ...jobs.asMap().entries.map((entry) {
            final index = entry.key;
            final job = entry.value;
            return Positioned(
              left: _mapLng(job.lng ?? -89.65) * (350),
              top: _mapLat(job.lat ?? 39.78) * (height),
              child: _JobMarker(
                index: index + 1,
                job: job,
                isCompleted: job.status.name == 'completed',
              ),
            );
          }),
          // Current location marker
          if (currentLat != null && currentLng != null)
            Positioned(
              left: _mapLng(currentLng!) * 350 - 10,
              top: _mapLat(currentLat!) * height - 10,
              child: Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  color: Colors.blue,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3),
                  boxShadow: const [BoxShadow(blurRadius: 4, color: Colors.black26)],
                ),
              ),
            ),
          // Overlay label
          Positioned(
            top: 10,
            right: 10,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '${jobs.length} stops',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  double _mapLat(double lat) {
    // Map lat 39.76-39.80 to 0.1-0.9 of height
    return ((lat - 39.76) / 0.04 * 0.8 + 0.1).clamp(0.05, 0.95);
  }

  double _mapLng(double lng) {
    // Map lng -89.67 to -89.62 to 0.1-0.9 of width
    return ((-89.62 - lng) / 0.05 * 0.8 + 0.1).clamp(0.05, 0.95);
  }
}

class _JobMarker extends StatelessWidget {
  final int index;
  final Job job;
  final bool isCompleted;

  const _JobMarker({required this.index, required this.job, required this.isCompleted});

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: '${job.customerName}\n${job.address}',
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          color: isCompleted ? Colors.green : Colors.teal,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: const [BoxShadow(blurRadius: 3, color: Colors.black26)],
        ),
        child: Center(
          child: Text(
            '$index',
            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}

class _MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.teal.withOpacity(0.1)
      ..strokeWidth = 1;

    for (double x = 0; x < size.width; x += 40) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += 40) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(_) => false;
}
