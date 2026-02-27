import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/diagnosis_provider.dart';
import '../../widgets/trade_selector.dart';

class DiagnoseScreen extends ConsumerStatefulWidget {
  const DiagnoseScreen({super.key});

  @override
  ConsumerState<DiagnoseScreen> createState() => _DiagnoseScreenState();
}

class _DiagnoseScreenState extends ConsumerState<DiagnoseScreen> {
  File? _selectedImage;
  final _descriptionCtrl = TextEditingController();
  final _picker = ImagePicker();

  @override
  void dispose() {
    _descriptionCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? picked = await _picker.pickImage(source: source, imageQuality: 85, maxWidth: 1280);
      if (picked != null) {
        setState(() => _selectedImage = File(picked.path));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not pick image: $e')));
      }
    }
  }

  Future<void> _analyze() async {
    final desc = _descriptionCtrl.text.trim();
    if (desc.isEmpty && _selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please add a photo or describe the problem')),
      );
      return;
    }

    final trade = ref.read(diagnosisProvider).selectedTrade;
    final diagnosis = await ref.read(diagnosisProvider.notifier).analyzeProblem(
      imageFile: _selectedImage,
      description: desc.isEmpty ? 'No description provided' : desc,
      trade: trade,
    );

    if (mounted && diagnosis != null) {
      context.go('/diagnose/result', extra: diagnosis);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(diagnosisProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('AI Diagnosis')),
      body: state.isAnalyzing
          ? _AnalyzingState()
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Trade selection
                  Text('Select Trade', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  TradeSelector(
                    selectedTrade: state.selectedTrade,
                    onTradeSelected: (t) => ref.read(diagnosisProvider.notifier).setTrade(t),
                  ),
                  const SizedBox(height: 24),

                  // Photo section
                  Text('Photo (Optional but recommended)', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),

                  if (_selectedImage != null) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.file(
                        _selectedImage!,
                        height: 220,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _pickImage(ImageSource.camera),
                            icon: const Icon(Icons.camera_alt_outlined),
                            label: const Text('Retake'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => setState(() => _selectedImage = null),
                            icon: const Icon(Icons.delete_outline),
                            label: const Text('Remove'),
                          ),
                        ),
                      ],
                    ),
                  ] else ...[
                    Row(
                      children: [
                        Expanded(
                          child: _ImagePickButton(
                            icon: Icons.camera_alt,
                            label: 'Take Photo',
                            onTap: () => _pickImage(ImageSource.camera),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _ImagePickButton(
                            icon: Icons.photo_library_outlined,
                            label: 'From Gallery',
                            onTap: () => _pickImage(ImageSource.gallery),
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 24),

                  // Description
                  Text('Describe the Problem', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _descriptionCtrl,
                    maxLines: 5,
                    decoration: const InputDecoration(
                      hintText: 'Describe what you see, hear, or smell. The more detail, the better the diagnosis...',
                      alignLabelWithHint: true,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Prompt suggestions
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: [
                      _PromptChip(label: 'Water leaking from...', onTap: (t) => _descriptionCtrl.text = t),
                      _PromptChip(label: 'Circuit breaker keeps tripping', onTap: (t) => _descriptionCtrl.text = t),
                      _PromptChip(label: 'AC not cooling properly', onTap: (t) => _descriptionCtrl.text = t),
                      _PromptChip(label: 'Strange noise coming from...', onTap: (t) => _descriptionCtrl.text = t),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Analyze button
                  ElevatedButton.icon(
                    onPressed: _analyze,
                    icon: const Icon(Icons.auto_awesome),
                    label: const Text('Analyze with AI'),
                  ),

                  if (state.error != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.red.shade200),
                      ),
                      child: Text('Error: ${state.error}', style: TextStyle(color: Colors.red.shade700)),
                    ),
                  ],
                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }
}

class _ImagePickButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ImagePickButton({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 24),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFF59E0B), width: 2, style: BorderStyle.solid),
          borderRadius: BorderRadius.circular(12),
          color: const Color(0xFFFEF3C7),
        ),
        child: Column(
          children: [
            Icon(icon, size: 32, color: const Color(0xFFF59E0B)),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF92400E))),
          ],
        ),
      ),
    );
  }
}

class _PromptChip extends StatelessWidget {
  final String label;
  final Function(String) onTap;

  const _PromptChip({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      label: Text(label, style: const TextStyle(fontSize: 12)),
      onPressed: () => onTap(label),
      backgroundColor: const Color(0xFFFEF3C7),
      side: const BorderSide(color: Color(0xFFFCD34D)),
    );
  }
}

class _AnalyzingState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(
              width: 80,
              height: 80,
              child: CircularProgressIndicator(strokeWidth: 6, color: Color(0xFFF59E0B)),
            ),
            const SizedBox(height: 32),
            const Text('Analyzing...', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            Text(
              'AI is examining your photo and description to diagnose the problem',
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ...[
              'Identifying problem type...',
              'Checking common failure points...',
              'Preparing step-by-step fix...',
            ].asMap().entries.map((e) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.check_circle_outline, size: 16, color: Color(0xFFF59E0B)),
                  const SizedBox(width: 8),
                  Text(e.value, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}
