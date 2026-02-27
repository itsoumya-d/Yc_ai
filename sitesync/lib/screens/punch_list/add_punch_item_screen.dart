import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';
import '../../models/punch_item.dart';
import '../../providers/punch_list_provider.dart';

class AddPunchItemScreen extends ConsumerStatefulWidget {
  const AddPunchItemScreen({super.key});

  @override
  ConsumerState<AddPunchItemScreen> createState() => _AddPunchItemScreenState();
}

class _AddPunchItemScreenState extends ConsumerState<AddPunchItemScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  final _assigneeController = TextEditingController();
  PunchPriority _priority = PunchPriority.medium;
  DateTime? _dueDate;
  final List<String> _photos = [];
  bool _isSaving = false;

  @override
  void dispose() {
    _descriptionController.dispose();
    _locationController.dispose();
    _assigneeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Punch Item'),
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => context.pop(),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Description *', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _descriptionController,
              maxLines: 3,
              decoration: const InputDecoration(hintText: 'Describe the issue or item to fix...'),
              validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 20),
            const Text('Location *', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _locationController,
              decoration: const InputDecoration(hintText: 'e.g., Building A, 2nd Floor, Room 204'),
              validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 20),
            const Text('Priority', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              children: PunchPriority.values.map((p) {
                final isSelected = _priority == p;
                Color color;
                switch (p) {
                  case PunchPriority.critical:
                    color = Colors.red;
                  case PunchPriority.high:
                    color = Colors.orange;
                  case PunchPriority.medium:
                    color = Colors.amber;
                  case PunchPriority.low:
                    color = Colors.green;
                }
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _priority = p),
                    child: Container(
                      margin: const EdgeInsets.only(right: 6),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: isSelected ? color.withOpacity(0.2) : Colors.grey.shade100,
                        border: Border.all(color: isSelected ? color : Colors.grey.shade300, width: isSelected ? 2 : 1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        p.name.toUpperCase(),
                        style: TextStyle(
                          fontSize: 11,
                          color: isSelected ? color : Colors.grey,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            const Text('Assigned To', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _assigneeController,
              decoration: const InputDecoration(hintText: 'Enter team member or contractor name'),
            ),
            const SizedBox(height: 20),
            const Text('Due Date', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            InkWell(
              onTap: _pickDueDate,
              child: InputDecorator(
                decoration: const InputDecoration(),
                child: Text(
                  _dueDate != null
                      ? '${_dueDate!.month}/${_dueDate!.day}/${_dueDate!.year}'
                      : 'Select a due date (optional)',
                  style: TextStyle(color: _dueDate != null ? null : Colors.grey),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text('Photos', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              children: [
                OutlinedButton.icon(
                  onPressed: _pickPhoto,
                  icon: const Icon(Icons.camera_alt_outlined),
                  label: const Text('Camera'),
                ),
                const SizedBox(width: 12),
                OutlinedButton.icon(
                  onPressed: _pickGallery,
                  icon: const Icon(Icons.photo_library_outlined),
                  label: const Text('Gallery'),
                ),
              ],
            ),
            if (_photos.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text('${_photos.length} photo(s) added', style: const TextStyle(color: Colors.green)),
            ],
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: _isSaving ? null : _save,
              style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
              child: _isSaving
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('ADD TO PUNCH LIST', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickDueDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _dueDate ?? DateTime.now().add(const Duration(days: 7)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _dueDate = picked);
  }

  Future<void> _pickPhoto() async {
    final image = await ImagePicker().pickImage(source: ImageSource.camera, imageQuality: 75);
    if (image != null) setState(() => _photos.add(image.path));
  }

  Future<void> _pickGallery() async {
    final images = await ImagePicker().pickMultiImage(imageQuality: 75);
    if (images.isNotEmpty) setState(() => _photos.addAll(images.map((i) => i.path)));
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    try {
      final item = PunchItem(
        id: const Uuid().v4(),
        projectId: '1',
        description: _descriptionController.text.trim(),
        location: _locationController.text.trim(),
        priority: _priority,
        status: PunchStatus.open,
        assignedTo: _assigneeController.text.trim(),
        dueDate: _dueDate,
        photos: _photos,
        createdAt: DateTime.now(),
      );
      await ref.read(punchListProvider.notifier).addItem(item);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Punch item added!'), backgroundColor: Colors.green),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }
}
