import 'package:flutter/material.dart';

class ProgressStreak extends StatelessWidget {
  final int streakDays;
  final bool compact;

  const ProgressStreak({super.key, required this.streakDays, this.compact = false});

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('🔥', style: TextStyle(fontSize: 16)),
          const SizedBox(width: 4),
          Text(
            '$streakDays day${streakDays != 1 ? 's' : ''}',
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFFF97316)),
          ),
        ],
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF1F2), Color(0xFFFFE4E6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFDA4AF).withOpacity(0.4)),
      ),
      child: Row(
        children: [
          const Text('🔥', style: TextStyle(fontSize: 36)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$streakDays Day Streak',
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFFF97316),
                  ),
                ),
                Text(
                  streakDays == 0
                      ? 'Complete today\'s check to start your streak!'
                      : streakDays == 1
                          ? 'Great start! Keep it up tomorrow.'
                          : 'Keep going! You\'re building healthy habits.',
                  style: const TextStyle(fontSize: 13, color: Color(0xFF9F1239)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class WeeklyStreakDots extends StatelessWidget {
  final List<bool> completedDays; // 7 booleans, index 0 = 6 days ago, index 6 = today

  const WeeklyStreakDots({super.key, required this.completedDays});

  @override
  Widget build(BuildContext context) {
    final days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: List.generate(7, (i) {
        final done = i < completedDays.length && completedDays[i];
        final isToday = i == 6;

        return Column(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: done
                    ? const Color(0xFFE11D48)
                    : isToday
                        ? const Color(0xFFFECDD3)
                        : const Color(0xFFF3F4F6),
                border: isToday ? Border.all(color: const Color(0xFFE11D48), width: 2) : null,
              ),
              child: Center(
                child: done
                    ? const Icon(Icons.check, size: 18, color: Colors.white)
                    : isToday
                        ? const Icon(Icons.circle, size: 8, color: Color(0xFFE11D48))
                        : const SizedBox.shrink(),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              days[i % 7],
              style: TextStyle(
                fontSize: 11,
                fontWeight: isToday ? FontWeight.w700 : FontWeight.normal,
                color: isToday ? const Color(0xFFE11D48) : Colors.grey.shade500,
              ),
            ),
          ],
        );
      }),
    );
  }
}
