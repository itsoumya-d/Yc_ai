import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class SearchBarWidget extends StatefulWidget {
  final String hint;
  final ValueChanged<String> onChanged;
  final VoidCallback? onTap;
  final bool readOnly;
  final TextEditingController? controller;

  const SearchBarWidget({
    super.key,
    this.hint = 'Search government services...',
    required this.onChanged,
    this.onTap,
    this.readOnly = false,
    this.controller,
  });

  @override
  State<SearchBarWidget> createState() => _SearchBarWidgetState();
}

class _SearchBarWidgetState extends State<SearchBarWidget> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        controller: _controller,
        onChanged: widget.onChanged,
        onTap: widget.onTap,
        readOnly: widget.readOnly,
        decoration: InputDecoration(
          hintText: widget.hint,
          hintStyle: const TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 14,
          ),
          prefixIcon: const Icon(
            Icons.search,
            color: Color(0xFF94A3B8),
          ),
          suffixIcon: _controller.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, color: Color(0xFF94A3B8)),
                  onPressed: () {
                    _controller.clear();
                    widget.onChanged('');
                  },
                )
              : const Icon(
                  Icons.auto_awesome,
                  color: AppTheme.primaryBlue,
                  size: 20,
                ),
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }
}
