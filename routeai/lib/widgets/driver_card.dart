import 'package:flutter/material.dart';
import '../models/driver.dart';

class DriverCard extends StatelessWidget {
  final Driver driver;
  final VoidCallback? onTap;

  const DriverCard({super.key, required this.driver, this.onTap});

  Color _statusColor() {
    switch (driver.status) {
      case DriverStatus.available:
        return Colors.green;
      case DriverStatus.busy:
        return Colors.orange;
      case DriverStatus.offline:
        return Colors.grey;
    }
  }

  String _statusLabel() {
    switch (driver.status) {
      case DriverStatus.available:
        return 'Available';
      case DriverStatus.busy:
        return 'On Job';
      case DriverStatus.offline:
        return 'Offline';
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
              Stack(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: Colors.teal.shade100,
                    child: Text(
                      driver.name.isNotEmpty ? driver.name[0] : '?',
                      style: TextStyle(color: Colors.teal.shade800, fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                  ),
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: _statusColor(),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(driver.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    Text(driver.vehicle, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: _statusColor().withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            _statusLabel(),
                            style: TextStyle(color: _statusColor(), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text('${driver.jobsToday} jobs today', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                      ],
                    ),
                  ],
                ),
              ),
              if (driver.phone != null) ...[
                IconButton(
                  icon: const Icon(Icons.phone_outlined, color: Colors.teal),
                  onPressed: () {},
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
