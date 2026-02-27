import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import '../../models/job.dart';
import '../../providers/jobs_provider.dart';

class AddJobScreen extends ConsumerStatefulWidget {
  const AddJobScreen({super.key});

  @override
  ConsumerState<AddJobScreen> createState() => _AddJobScreenState();
}

class _AddJobScreenState extends ConsumerState<AddJobScreen> {
  final _formKey = GlobalKey<FormState>();
  final _customerController = TextEditingController();
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();
  String _serviceType = 'HVAC Maintenance';
  DateTime _scheduledTime = DateTime.now().add(const Duration(hours: 2));
  int _durationMinutes = 60;
  bool _isSaving = false;

  final List<String> _serviceTypes = [
    'HVAC Maintenance', 'Plumbing Repair', 'Electrical Inspection',
    'Lawn Service', 'Window Cleaning', 'General Repair', 'Delivery', 'Other'
  ];

  @override
  void dispose() {
    _customerController.dispose();
    _addressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add New Job'),
        leading: IconButton(icon: const Icon(Icons.close, color: Colors.white), onPressed: () => context.pop()),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Customer Name *', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _customerController,
              decoration: const InputDecoration(hintText: 'Enter customer name'),
              validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            const Text('Service Address *', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(hintText: 'Enter full address'),
              validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            const Text('Service Type', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _serviceType,
              decoration: const InputDecoration(),
              items: _serviceTypes.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
              onChanged: (v) => setState(() => _serviceType = v!),
            ),
            const SizedBox(height: 16),
            const Text('Scheduled Time', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            InkWell(
              onTap: _pickDateTime,
              child: InputDecorator(
                decoration: const InputDecoration(),
                child: Text(DateFormat('EEE, MMM d  h:mm a').format(_scheduledTime)),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Duration (minutes)', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              children: [
                IconButton(
                  onPressed: () => setState(() => _durationMinutes = (_durationMinutes - 15).clamp(15, 480)),
                  icon: const Icon(Icons.remove_circle_outline),
                  color: Theme.of(context).colorScheme.primary,
                ),
                Text('$_durationMinutes min', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                IconButton(
                  onPressed: () => setState(() => _durationMinutes = (_durationMinutes + 15).clamp(15, 480)),
                  icon: const Icon(Icons.add_circle_outline),
                  color: Theme.of(context).colorScheme.primary,
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Notes', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _notesController,
              maxLines: 3,
              decoration: const InputDecoration(hintText: 'Special instructions, access codes...'),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isSaving ? null : _save,
              style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
              child: _isSaving
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('CREATE JOB', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _scheduledTime,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(_scheduledTime));
    if (time == null) return;
    setState(() => _scheduledTime = DateTime(date.year, date.month, date.day, time.hour, time.minute));
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    try {
      final job = Job(
        id: const Uuid().v4(),
        customerName: _customerController.text.trim(),
        address: _addressController.text.trim(),
        serviceType: _serviceType,
        scheduledTime: _scheduledTime,
        durationMinutes: _durationMinutes,
        status: JobStatus.scheduled,
        notes: _notesController.text.trim(),
      );
      await ref.read(jobsProvider.notifier).addJob(job);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Job created!'), backgroundColor: Colors.green),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }
}
