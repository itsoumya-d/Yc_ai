import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/skin_check.dart';
import '../../providers/spots_provider.dart';
import '../../widgets/body_map_widget.dart';

class AddSpotScreen extends ConsumerStatefulWidget {
  const AddSpotScreen({super.key});

  @override
  ConsumerState<AddSpotScreen> createState() => _AddSpotScreenState();
}

class _AddSpotScreenState extends ConsumerState<AddSpotScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  String _selectedLocation = '';
  File? _photo;
  bool _isSaving = false;
  final _picker = ImagePicker();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickPhoto(ImageSource source) async {
    final XFile? file = await _picker.pickImage(source: source, imageQuality: 90);
    if (file != null) setState(() => _photo = File(file.path));
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() || _selectedLocation.isEmpty) {
      if (_selectedLocation.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a body location on the map')),
        );
      }
      return;
    }
    setState(() => _isSaving = true);

    final spot = await ref.read(spotsProvider.notifier).addSpot(
      name: _nameCtrl.text,
      locationOnBody: _selectedLocation,
      notes: _notesCtrl.text.isEmpty ? null : _notesCtrl.text,
      photo: _photo,
    );

    if (mounted && spot != null) {
      context.go('/spots/${spot.id}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add New Spot'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.go('/spots'),
        ),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Name
              const _SectionTitle('Spot Name'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _nameCtrl,
                decoration: const InputDecoration(
                  hintText: 'e.g., Left shoulder mole, Back spot #2',
                  prefixIcon: Icon(Icons.label_outline),
                ),
                validator: (v) => v?.isEmpty == true ? 'Please enter a name' : null,
              ),
              const SizedBox(height: 20),

              // Body location
              const _SectionTitle('Select Location on Body'),
              const SizedBox(height: 4),
              Text(
                _selectedLocation.isEmpty ? 'Tap the body map to select location' : 'Selected: ${BodyRegion.displayName(_selectedLocation)}',
                style: TextStyle(
                  color: _selectedLocation.isEmpty ? Colors.grey : const Color(0xFFE11D48),
                  fontWeight: _selectedLocation.isEmpty ? FontWeight.normal : FontWeight.w600,
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: SizedBox(
                  width: 200,
                  child: BodyMapWidget(
                    checkedRegions: {if (_selectedLocation.isNotEmpty) _selectedLocation: true},
                    onRegionTapped: (region) => setState(() => _selectedLocation = region),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Photo
              const _SectionTitle('Photo (Recommended)'),
              const SizedBox(height: 8),
              if (_photo != null) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.file(_photo!, height: 200, width: double.infinity, fit: BoxFit.cover),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(child: OutlinedButton.icon(onPressed: () => _pickPhoto(ImageSource.camera), icon: const Icon(Icons.camera_alt_outlined), label: const Text('Retake'))),
                    const SizedBox(width: 8),
                    Expanded(child: OutlinedButton.icon(onPressed: () => setState(() => _photo = null), icon: const Icon(Icons.delete_outline), label: const Text('Remove'))),
                  ],
                ),
              ] else ...[
                Row(
                  children: [
                    Expanded(
                      child: _PhotoButton(icon: Icons.camera_alt, label: 'Camera', onTap: () => _pickPhoto(ImageSource.camera)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _PhotoButton(icon: Icons.photo_library_outlined, label: 'Gallery', onTap: () => _pickPhoto(ImageSource.gallery)),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 20),

              // Notes
              const _SectionTitle('Notes (Optional)'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _notesCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Describe the spot — size, color, any concerns...',
                ),
              ),
              const SizedBox(height: 32),

              ElevatedButton(
                onPressed: _isSaving ? null : _save,
                child: _isSaving
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Add Spot'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Color(0xFFE11D48)));
  }
}

class _PhotoButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _PhotoButton({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFFDA4AF), width: 2),
          borderRadius: BorderRadius.circular(12),
          color: const Color(0xFFFFF1F2),
        ),
        child: Column(
          children: [
            Icon(icon, color: const Color(0xFFE11D48), size: 28),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(color: Color(0xFFE11D48), fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
