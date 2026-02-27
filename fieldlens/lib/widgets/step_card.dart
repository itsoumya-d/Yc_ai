import 'package:flutter/material.dart';

class StepCard extends StatefulWidget {
  final int stepNumber;
  final String title;
  final String instruction;
  final String? tip;
  final bool startExpanded;

  const StepCard({
    super.key,
    required this.stepNumber,
    required this.title,
    required this.instruction,
    this.tip,
    this.startExpanded = false,
  });

  @override
  State<StepCard> createState() => _StepCardState();
}

class _StepCardState extends State<StepCard> with SingleTickerProviderStateMixin {
  late bool _expanded;
  late AnimationController _controller;
  late Animation<double> _expandAnimation;

  @override
  void initState() {
    super.initState();
    _expanded = widget.startExpanded;
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
      value: _expanded ? 1.0 : 0.0,
    );
    _expandAnimation = CurvedAnimation(parent: _controller, curve: Curves.easeInOut);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggle() {
    setState(() => _expanded = !_expanded);
    if (_expanded) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: _toggle,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Step number badge
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B),
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '${widget.stepNumber}',
                      style: const TextStyle(
                        color: Color(0xFF1C1917),
                        fontWeight: FontWeight.w800,
                        fontSize: 14,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      widget.title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                      ),
                    ),
                  ),
                  Icon(
                    _expanded ? Icons.expand_less : Icons.expand_more,
                    color: Colors.grey.shade500,
                  ),
                ],
              ),
              SizeTransition(
                sizeFactor: _expandAnimation,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 12),
                    Padding(
                      padding: const EdgeInsets.only(left: 44),
                      child: Text(
                        widget.instruction,
                        style: const TextStyle(fontSize: 14, height: 1.5),
                      ),
                    ),
                    if (widget.tip != null) ...[
                      const SizedBox(height: 10),
                      Padding(
                        padding: const EdgeInsets.only(left: 44),
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFFCD34D)),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('💡', style: TextStyle(fontSize: 14)),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  widget.tip!,
                                  style: const TextStyle(fontSize: 13, color: Color(0xFF92400E)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
