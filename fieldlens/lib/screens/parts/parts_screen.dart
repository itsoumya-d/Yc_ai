import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../../models/part.dart';

class PartsScreen extends StatefulWidget {
  const PartsScreen({super.key});

  @override
  State<PartsScreen> createState() => _PartsScreenState();
}

class _PartsScreenState extends State<PartsScreen> {
  final _searchCtrl = TextEditingController();
  final _picker = ImagePicker();
  String _searchQuery = '';
  final List<Part> _parts = Part.sampleData();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<Part> get _filtered {
    if (_searchQuery.isEmpty) return _parts;
    return _parts.where((p) =>
      p.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
      p.partNumber.toLowerCase().contains(_searchQuery.toLowerCase()) ||
      p.description.toLowerCase().contains(_searchQuery.toLowerCase())
    ).toList();
  }

  Future<void> _scanPart() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.camera);
    if (image != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Part identification from image coming soon — AI will identify your part')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$');
    final filtered = _filtered;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Parts Identification'),
        actions: [
          IconButton(
            icon: const Icon(Icons.camera_alt_outlined),
            onPressed: _scanPart,
            tooltip: 'Scan Part',
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: const Color(0xFF1C1917),
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              children: [
                TextField(
                  controller: _searchCtrl,
                  onChanged: (v) => setState(() => _searchQuery = v),
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Search by name, part number...',
                    hintStyle: const TextStyle(color: Colors.white54),
                    prefixIcon: const Icon(Icons.search, color: Colors.white54),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.15),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 12),
                InkWell(
                  onTap: _scanPart,
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: const Color(0xFFFBBF24), width: 1.5),
                      borderRadius: BorderRadius.circular(12),
                      color: const Color(0xFFFBBF24).withOpacity(0.1),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.camera_alt, color: Color(0xFFFBBF24), size: 18),
                        SizedBox(width: 8),
                        Text('Take Photo to Identify Part', style: TextStyle(color: Color(0xFFFBBF24), fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: filtered.isEmpty
                ? Center(child: Text('No parts found', style: TextStyle(color: Colors.grey.shade600)))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, i) {
                      final part = filtered[i];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(10)),
                                    child: const Icon(Icons.settings, color: Color(0xFFF59E0B), size: 22),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(part.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                                        Text('Part #: ${part.partNumber}', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                                      ],
                                    ),
                                  ),
                                  if (part.estimatedCost != null)
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text(currency.format(part.estimatedCost), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Color(0xFFF59E0B))),
                                        Text('est. price', style: TextStyle(fontSize: 10, color: Colors.grey.shade500)),
                                      ],
                                    ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Text(part.description, style: const TextStyle(fontSize: 13, height: 1.4)),
                              if (part.compatibleWith.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 6,
                                  children: part.compatibleWith.map((c) => Chip(
                                    label: Text(c, style: const TextStyle(fontSize: 10)),
                                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                    padding: EdgeInsets.zero,
                                    backgroundColor: const Color(0xFFF3F4F6),
                                    side: BorderSide.none,
                                  )).toList(),
                                ),
                              ],
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  const Icon(Icons.store_outlined, size: 14, color: Colors.grey),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      'Available at: ${part.suppliers.join(', ')}',
                                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
