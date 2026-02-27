import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../models/product.dart';
import '../../models/inventory_movement.dart';
import '../../providers/inventory_provider.dart';
import '../../widgets/stock_level_indicator.dart';

class ProductScreen extends ConsumerStatefulWidget {
  final String productId;
  const ProductScreen({super.key, required this.productId});

  @override
  ConsumerState<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends ConsumerState<ProductScreen> {
  bool _isEditing = false;
  late TextEditingController _nameCtrl;
  late TextEditingController _skuCtrl;
  late TextEditingController _categoryCtrl;
  late TextEditingController _priceCtrl;
  late TextEditingController _minQtyCtrl;
  late TextEditingController _locationCtrl;
  late TextEditingController _supplierCtrl;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController();
    _skuCtrl = TextEditingController();
    _categoryCtrl = TextEditingController();
    _priceCtrl = TextEditingController();
    _minQtyCtrl = TextEditingController();
    _locationCtrl = TextEditingController();
    _supplierCtrl = TextEditingController();
  }

  void _initControllers(Product p) {
    _nameCtrl.text = p.name;
    _skuCtrl.text = p.sku;
    _categoryCtrl.text = p.category;
    _priceCtrl.text = p.unitPrice.toStringAsFixed(2);
    _minQtyCtrl.text = p.minQuantity.toString();
    _locationCtrl.text = p.location ?? '';
    _supplierCtrl.text = p.supplier ?? '';
  }

  @override
  void dispose() {
    _nameCtrl.dispose(); _skuCtrl.dispose(); _categoryCtrl.dispose();
    _priceCtrl.dispose(); _minQtyCtrl.dispose(); _locationCtrl.dispose(); _supplierCtrl.dispose();
    super.dispose();
  }

  void _showAdjustModal(Product product) {
    final ctrl = TextEditingController();
    final noteCtrl = TextEditingController();
    int delta = 0;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(left: 24, right: 24, top: 24, bottom: MediaQuery.of(ctx).viewInsets.bottom + 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Adjust Stock', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              Row(
                children: [
                  const Text('Type: ', style: TextStyle(fontWeight: FontWeight.w500)),
                  const SizedBox(width: 8),
                  ChoiceChip(label: const Text('Add'), selected: delta >= 0, onSelected: (v) => setModalState(() => delta = 1)),
                  const SizedBox(width: 8),
                  ChoiceChip(label: const Text('Remove'), selected: delta < 0, onSelected: (v) => setModalState(() => delta = -1)),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: ctrl,
                keyboardType: TextInputType.number,
                onChanged: (v) {
                  final qty = int.tryParse(v) ?? 0;
                  delta = delta >= 0 ? qty : -qty;
                },
                decoration: const InputDecoration(labelText: 'Quantity'),
              ),
              const SizedBox(height: 12),
              TextFormField(controller: noteCtrl, decoration: const InputDecoration(labelText: 'Note (optional)')),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  final qty = int.tryParse(ctrl.text) ?? 0;
                  if (qty > 0) {
                    ref.read(inventoryProvider.notifier).adjustQuantity(
                      product.id, delta.sign * qty, noteCtrl.text.isEmpty ? null : noteCtrl.text,
                    );
                  }
                  Navigator.pop(ctx);
                },
                child: const Text('Confirm Adjustment'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _saveEdits(Product product) {
    final updated = product.copyWith(
      name: _nameCtrl.text,
      sku: _skuCtrl.text,
      category: _categoryCtrl.text,
      unitPrice: double.tryParse(_priceCtrl.text) ?? product.unitPrice,
      minQuantity: int.tryParse(_minQtyCtrl.text) ?? product.minQuantity,
      location: _locationCtrl.text.isEmpty ? null : _locationCtrl.text,
      supplier: _supplierCtrl.text.isEmpty ? null : _supplierCtrl.text,
      updatedAt: DateTime.now(),
    );
    ref.read(inventoryProvider.notifier).updateProduct(updated);
    setState(() => _isEditing = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Product updated'), backgroundColor: Color(0xFF059669)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(inventoryProvider);
    final Product? product = state.products.where((p) => p.id == widget.productId).firstOrNull;
    final theme = Theme.of(context);
    final currency = NumberFormat.currency(symbol: '\$');

    if (product == null) {
      return const Scaffold(body: Center(child: Text('Product not found')));
    }

    if (_isEditing && _nameCtrl.text.isEmpty) {
      _initControllers(product);
    }

    final productMovements = state.movements.where((m) => m.productId == product.id).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Product' : product.name),
        actions: [
          if (_isEditing) ...[
            TextButton(
              onPressed: () => setState(() => _isEditing = false),
              child: const Text('Cancel', style: TextStyle(color: Colors.white)),
            ),
            TextButton(
              onPressed: () => _saveEdits(product),
              child: const Text('Save', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
            ),
          ] else
            IconButton(
              icon: const Icon(Icons.edit, color: Colors.white),
              onPressed: () {
                _initControllers(product);
                setState(() => _isEditing = true);
              },
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: _isEditing
            ? _EditForm(
                nameCtrl: _nameCtrl,
                skuCtrl: _skuCtrl,
                categoryCtrl: _categoryCtrl,
                priceCtrl: _priceCtrl,
                minQtyCtrl: _minQtyCtrl,
                locationCtrl: _locationCtrl,
                supplierCtrl: _supplierCtrl,
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Stock level card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          StockLevelIndicator(product: product),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () => _showAdjustModal(product),
                                  icon: const Icon(Icons.tune),
                                  label: const Text('Adjust Stock'),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Product details
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Product Details', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 12),
                          _DetailRow('SKU', product.sku),
                          if (product.barcode != null) _DetailRow('Barcode', product.barcode!),
                          _DetailRow('Category', product.category),
                          _DetailRow('Unit Price', currency.format(product.unitPrice)),
                          _DetailRow('Total Value', currency.format(product.totalValue)),
                          _DetailRow('Min Quantity', product.minQuantity.toString()),
                          if (product.location != null) _DetailRow('Location', product.location!),
                          if (product.supplier != null) _DetailRow('Supplier', product.supplier!),
                          _DetailRow('Last Updated', DateFormat('MMM d, yyyy').format(product.updatedAt)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Movement history
                  Text('Stock History', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  if (productMovements.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Text('No movement history', style: TextStyle(color: Colors.grey.shade600)),
                      ),
                    )
                  else
                    ...productMovements.take(10).map((m) => _MovementRow(movement: m)),
                ],
              ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  const _DetailRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}

class _MovementRow extends StatelessWidget {
  final InventoryMovement movement;
  const _MovementRow({required this.movement});

  @override
  Widget build(BuildContext context) {
    final isIn = movement.type.isInbound;
    final color = isIn ? const Color(0xFF059669) : const Color(0xFFEF4444);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Icon(isIn ? Icons.arrow_circle_down : Icons.arrow_circle_up, color: color),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(movement.type.displayName, style: const TextStyle(fontWeight: FontWeight.w600)),
                if (movement.note != null)
                  Text(movement.note!, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                Text(DateFormat('MMM d, h:mm a').format(movement.createdAt), style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
          Text(
            '${isIn ? '+' : '-'}${movement.quantity}',
            style: TextStyle(fontWeight: FontWeight.w700, color: color, fontSize: 16),
          ),
        ],
      ),
    );
  }
}

class _EditForm extends StatelessWidget {
  final TextEditingController nameCtrl, skuCtrl, categoryCtrl, priceCtrl, minQtyCtrl, locationCtrl, supplierCtrl;

  const _EditForm({
    required this.nameCtrl, required this.skuCtrl, required this.categoryCtrl,
    required this.priceCtrl, required this.minQtyCtrl, required this.locationCtrl, required this.supplierCtrl,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextFormField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Product Name *')),
        const SizedBox(height: 12),
        TextFormField(controller: skuCtrl, decoration: const InputDecoration(labelText: 'SKU *')),
        const SizedBox(height: 12),
        TextFormField(controller: categoryCtrl, decoration: const InputDecoration(labelText: 'Category *')),
        const SizedBox(height: 12),
        TextFormField(controller: priceCtrl, decoration: const InputDecoration(labelText: 'Unit Price', prefixText: '\$'), keyboardType: TextInputType.number),
        const SizedBox(height: 12),
        TextFormField(controller: minQtyCtrl, decoration: const InputDecoration(labelText: 'Minimum Quantity'), keyboardType: TextInputType.number),
        const SizedBox(height: 12),
        TextFormField(controller: locationCtrl, decoration: const InputDecoration(labelText: 'Storage Location')),
        const SizedBox(height: 12),
        TextFormField(controller: supplierCtrl, decoration: const InputDecoration(labelText: 'Supplier')),
      ],
    );
  }
}
