import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/applications_provider.dart';
import '../../providers/services_provider.dart';
import '../../models/application.dart';
import '../../theme/app_theme.dart';

class AddApplicationScreen extends ConsumerStatefulWidget {
  const AddApplicationScreen({super.key});

  @override
  ConsumerState<AddApplicationScreen> createState() => _AddApplicationScreenState();
}

class _AddApplicationScreenState extends ConsumerState<AddApplicationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _notesController = TextEditingController();
  String? _selectedServiceId;
  ApplicationStatus _selectedStatus = ApplicationStatus.submitted;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedServiceId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a service')),
      );
      return;
    }

    final services = ref.read(servicesProvider);
    final service = services.firstWhere((s) => s.id == _selectedServiceId);

    final application = Application(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      serviceId: _selectedServiceId!,
      serviceName: service.name,
      status: _selectedStatus,
      submittedAt: DateTime.now(),
      notes: _notesController.text.isEmpty ? null : _notesController.text,
      documents: [],
      statusHistory: [
        StatusUpdate(
          status: _selectedStatus,
          date: DateTime.now(),
          message: 'Application tracked',
        ),
      ],
    );

    ref.read(applicationsProvider.notifier).addApplication(application);
    context.go('/my-applications');
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Application added successfully'),
        backgroundColor: AppTheme.successGreen,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final services = ref.watch(servicesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Track Application'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.go('/my-applications'),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Select Service',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedServiceId,
                hint: const Text('Choose a government service'),
                decoration: const InputDecoration(),
                onChanged: (value) => setState(() => _selectedServiceId = value),
                items: services.map((service) {
                  return DropdownMenuItem(
                    value: service.id,
                    child: Text(service.name),
                  );
                }).toList(),
                validator: (value) {
                  if (value == null) return 'Please select a service';
                  return null;
                },
              ),
              const SizedBox(height: 20),
              const Text(
                'Current Status',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: ApplicationStatus.values.map((status) {
                  final isSelected = _selectedStatus == status;
                  return ChoiceChip(
                    label: Text(status.label),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) setState(() => _selectedStatus = status);
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
              const Text(
                'Notes (Optional)',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _notesController,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Add any notes about this application...',
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _submit,
                child: const Text('Add to Tracker'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
