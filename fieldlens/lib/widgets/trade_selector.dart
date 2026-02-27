import 'package:flutter/material.dart';

class TradeSelector extends StatelessWidget {
  final String selectedTrade;
  final Function(String) onTradeSelected;
  final bool horizontal;

  const TradeSelector({
    super.key,
    required this.selectedTrade,
    required this.onTradeSelected,
    this.horizontal = true,
  });

  static const List<_TradeItem> trades = [
    _TradeItem(id: 'plumbing', label: 'Plumbing', emoji: '🔧', icon: Icons.water_drop_outlined),
    _TradeItem(id: 'electrical', label: 'Electrical', emoji: '⚡', icon: Icons.electrical_services),
    _TradeItem(id: 'hvac', label: 'HVAC', emoji: '❄️', icon: Icons.air),
    _TradeItem(id: 'carpentry', label: 'Carpentry', emoji: '🪵', icon: Icons.handyman),
    _TradeItem(id: 'general', label: 'General', emoji: '🛠️', icon: Icons.build),
  ];

  @override
  Widget build(BuildContext context) {
    if (horizontal) {
      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: trades.map((trade) => Padding(
            padding: const EdgeInsets.only(right: 8),
            child: _TradePill(
              trade: trade,
              isSelected: selectedTrade == trade.id,
              onTap: () => onTradeSelected(trade.id),
            ),
          )).toList(),
        ),
      );
    }

    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.1,
      children: trades.map((trade) => _TradeCard(
        trade: trade,
        isSelected: selectedTrade == trade.id,
        onTap: () => onTradeSelected(trade.id),
      )).toList(),
    );
  }
}

class _TradePill extends StatelessWidget {
  final _TradeItem trade;
  final bool isSelected;
  final VoidCallback onTap;

  const _TradePill({required this.trade, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF59E0B) : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected ? const Color(0xFFF59E0B) : Colors.grey.shade300,
            width: 1.5,
          ),
          boxShadow: isSelected ? [
            BoxShadow(color: const Color(0xFFF59E0B).withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 2)),
          ] : [],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(trade.emoji, style: const TextStyle(fontSize: 16)),
            const SizedBox(width: 6),
            Text(
              trade.label,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: isSelected ? const Color(0xFF1C1917) : Colors.grey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TradeCard extends StatelessWidget {
  final _TradeItem trade;
  final bool isSelected;
  final VoidCallback onTap;

  const _TradeCard({required this.trade, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFFBBF24) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFFF59E0B) : Colors.grey.shade200,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(trade.emoji, style: const TextStyle(fontSize: 28)),
            const SizedBox(height: 6),
            Text(
              trade.label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isSelected ? const Color(0xFF1C1917) : Colors.grey.shade700,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _TradeItem {
  final String id;
  final String label;
  final String emoji;
  final IconData icon;

  const _TradeItem({required this.id, required this.label, required this.emoji, required this.icon});
}
