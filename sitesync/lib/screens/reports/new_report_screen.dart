import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:uuid/uuid.dart';
import '../../models/daily_report.dart';
import '../../providers/reports_provider.dart';

class NewReportScreen extends ConsumerStatefulWidget {
  const NewReportScreen({super.key});

  @override
  ConsumerState<NewReportScreen> createState() => _NewReportScreenState();
}

class _NewReportScreenState extends ConsumerState<NewReportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _workController = TextEditingController();
  final _equipmentController = TextEditingController();
  final _issuesController = TextEditingController();
  String _selectedWeather = 'Sunny';
  int _crewCount = 5;
  String? _location;
  bool _isLocating = false;
  bool _isSaving = false;
  final List<String> _photoUrls = [];

  final List<String> _weatherOptions = [
    'Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Windy', 'Stormy', 'Foggy'
  ];

  @override
  void dispose() {
    _workController.dispose();
    _equipmentController.dispose();
    _issuesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Daily Report'),
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _submitReport,
            child: _isSaving
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                  )
                : const Text('SUBMIT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _SectionTitle(title: 'Weather Conditions'),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _weatherOptions.map((w) {
                  final isSelected = _selectedWeather == w;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(w),
                      selected: isSelected,
                      onSelected: (_) => setState(() => _selectedWeather = w),
                      selectedColor: Theme.of(context).colorScheme.primary,
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : null,
                        fontWeight: isSelected ? FontWeight.bold : null,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 20),
            _SectionTitle(title: 'Crew Count'),
            const SizedBox(height: 8),
            Row(
              children: [
                IconButton(
                  onPressed: () => setState(() => _crewCount = (_crewCount - 1).clamp(1, 100)),
                  icon: const Icon(Icons.remove_circle_outline),
                  color: Theme.of(context).colorScheme.primary,
                ),
                Text(
                  '$_crewCount',
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  onPressed: () => setState(() => _crewCount = (_crewCount + 1).clamp(1, 100)),
                  icon: const Icon(Icons.add_circle_outline),
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 8),
                const Text('workers on site', style: TextStyle(color: Colors.grey)),
              ],
            ),
            const SizedBox(height: 20),
            _SectionTitle(title: 'Work Performed *'),
            const SizedBox(height: 8),
            TextFormField(
              controller: _workController,
              maxLines: 5,
              decoration: const InputDecoration(
                hintText: 'Describe the work performed today in detail...',
              ),
              validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 20),
            _SectionTitle(title: 'Equipment Used'),
            const SizedBox(height: 8),
            TextFormField(
              controller: _equipmentController,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'List equipment and machinery used...',
              ),
            ),
            const SizedBox(height: 20),
            _SectionTitle(title: 'Issues / Delays'),
            const SizedBox(height: 8),
            TextFormField(
              controller: _issuesController,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Report any issues, delays, or safety concerns...',
              ),
            ),
            const SizedBox(height: 20),
            _SectionTitle(title: 'Site Photos'),
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
                  onPressed: _pickFromGallery,
                  icon: const Icon(Icons.photo_library_outlined),
                  label: const Text('Gallery'),
                ),
              ],
            ),
            if (_photoUrls.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text('${_photoUrls.length} photo(s) added', style: const TextStyle(color: Colors.green)),
            ],
            const SizedBox(height: 20),
            _SectionTitle(title: 'GPS Location'),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: _isLocating ? null : _getLocation,
              icon: _isLocating
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.my_location),
              label: Text(_location != null ? 'Location captured' : 'Capture Location'),
            ),
            if (_location != null)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  'GPS: $_location',
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                ),
              ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: _isSaving ? null : _submitReport,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(52),
              ),
              child: _isSaving
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('SUBMIT DAILY REPORT', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickPhoto() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.camera, imageQuality: 75);
    if (image != null) {
      setState(() => _photoUrls.add(image.path));
    }
  }

  Future<void> _pickFromGallery() async {
    final picker = ImagePicker();
    final images = await picker.pickMultiImage(imageQuality: 75);
    if (images.isNotEmpty) {
      setState(() => _photoUrls.addAll(images.map((i) => i.path)));
    }
  }

  Future<void> _getLocation() async {
    setState(() => _isLocating = true);
    try {
      final permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location permission denied')),
          );
        }
        return;
      }
      final position = await Geolocator.getCurrentPosition();
      setState(() => _location = '${position.latitude.toStringAsFixed(4)},${position.longitude.toStringAsFixed(4)}');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not get location: $e')),
        );
      }
    } finally {
      setState(() => _isLocating = false);
    }
  }

  Future<void> _submitReport() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    try {
      final report = DailyReport(
        id: const Uuid().v4(),
        projectId: '1', // Active project
        date: DateTime.now(),
        weather: _selectedWeather,
        crewCount: _crewCount,
        workPerformed: _workController.text.trim(),
        equipmentUsed: _equipmentController.text.trim(),
        issues: _issuesController.text.trim(),
        photos: _photoUrls,
        location: _location,
        createdBy: 'Current User',
        createdAt: DateTime.now(),
      );
      await ref.read(reportsProvider.notifier).addReport(report);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Daily report submitted successfully!'),
            backgroundColor: Colors.green,
          ),
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

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 0.3),
    );
  }
}
