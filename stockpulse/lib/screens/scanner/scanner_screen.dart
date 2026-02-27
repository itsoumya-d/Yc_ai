import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/product.dart';
import '../../providers/inventory_provider.dart';
import '../../widgets/barcode_scanner_widget.dart';
import '../../widgets/stock_level_indicator.dart';
import 'package:intl/intl.dart';

class ScannerScreen extends ConsumerStatefulWidget {
  const ScannerScreen({super.key});

  @override
  ConsumerState<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends ConsumerState<ScannerScreen> {
  Product? _scannedProduct;
  String? _lastBarcode;
  bool _showScanner = true;

  void _onBarcodeScanned(String barcode) {
    if (barcode == _lastBarcode) return;
    setState(() => _lastBarcode = barcode);
    final product = ref.read(inventoryProvider.notifier).findByBarcode(barcode);
    if (product != null) {
      setState(() {
        _scannedProduct = product;
        _showScanner = false;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('No product found for barcode: $barcode'),
          action: SnackBarAction(
            label: 'Add Product',
            onPressed: () => context.go('/inventory/add'),
          ),
        ),
      );
    }
  }

  void _adjustQuantity(int delta) {
    if (_scannedProduct == null) return;
    _showAdjustDialog(delta);
  }

  void _showAdjustDialog(int suggestedDelta) {
    final controller = TextEditingController(text: suggestedDelta.abs().toString());
    final noteController = TextEditingController();
    final isPositive = suggestedDelta > 0;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24, right: 24, top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isPositive ? 'Add Stock' : 'Remove Stock',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Quantity', prefixIcon: Icon(Icons.numbers)),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: noteController,
              decoration: const InputDecoration(labelText: 'Note (optional)', prefixIcon: Icon(Icons.note_outlined)),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                final qty = int.tryParse(controller.text) ?? 0;
                if (qty > 0) {
                  final delta = isPositive ? qty : -qty;
                  ref.read(inventoryProvider.notifier).adjustQuantity(
                    _scannedProduct!.id,
                    delta,
                    noteController.text.isEmpty ? null : noteController.text,
                  );
                  setState(() {
                    final updated = ref.read(inventoryProvider).products
                        .firstWhere((p) => p.id == _scannedProduct!.id, orElse: () => _scannedProduct!);
                    _scannedProduct = updated;
                  });
                }
                Navigator.pop(ctx);
              },
              child: Text(isPositive ? 'Add Stock' : 'Remove Stock'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Barcode Scanner'),
        actions: [
          if (!_showScanner)
            IconButton(
              icon: const Icon(Icons.qr_code_scanner, color: Colors.white),
              onPressed: () => setState(() {
                _showScanner = true;
                _scannedProduct = null;
                _lastBarcode = null;
              }),
              tooltip: 'Scan Again',
            ),
        ],
      ),
      body: _showScanner
          ? BarcodeScannerWidget(
              onScanned: _onBarcodeScanned,
              onClose: null,
            )
          : _scannedProduct == null
              ? const Center(child: Text('No product found'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Product header
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFD1FAE5),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Icon(Icons.inventory_2, color: Color(0xFF059669), size: 28),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          _scannedProduct!.name,
                                          style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                                        ),
                                        Text(
                                          'SKU: ${_scannedProduct!.sku}',
                                          style: TextStyle(color: Colors.grey.shade600),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              StockLevelIndicator(product: _scannedProduct!, showLabel: true),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  _DetailChip(label: 'Category', value: _scannedProduct!.category),
                                  const SizedBox(width: 8),
                                  _DetailChip(
                                    label: 'Price',
                                    value: NumberFormat.currency(symbol: '\$').format(_scannedProduct!.unitPrice),
                                  ),
                                ],
                              ),
                              if (_scannedProduct!.location != null) ...[
                                const SizedBox(height: 8),
                                _DetailChip(label: 'Location', value: _scannedProduct!.location!),
                              ],
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Quick adjustment buttons
                      Text('Quick Adjustment', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _QuickAdjustButton(
                              label: '-1',
                              icon: Icons.remove,
                              color: const Color(0xFFEF4444),
                              onTap: () => _adjustQuantity(-1),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _QuickAdjustButton(
                              label: '-10',
                              icon: Icons.remove_circle_outline,
                              color: const Color(0xFFF97316),
                              onTap: () => _adjustQuantity(-10),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _QuickAdjustButton(
                              label: '+10',
                              icon: Icons.add_circle_outline,
                              color: const Color(0xFF059669),
                              onTap: () => _adjustQuantity(10),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _QuickAdjustButton(
                              label: '+1',
                              icon: Icons.add,
                              color: const Color(0xFF059669),
                              onTap: () => _adjustQuantity(1),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      OutlinedButton.icon(
                        onPressed: () => _showAdjustDialog(0),
                        icon: const Icon(Icons.edit),
                        label: const Text('Custom Adjustment'),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 48),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // View full details
                      ElevatedButton.icon(
                        onPressed: () => context.go('/inventory/${_scannedProduct!.id}'),
                        icon: const Icon(Icons.open_in_new),
                        label: const Text('View Full Details'),
                      ),
                    ],
                  ),
                ),
    );
  }
}

class _DetailChip extends StatelessWidget {
  final String label;
  final String value;
  const _DetailChip({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _QuickAdjustButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _QuickAdjustButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
