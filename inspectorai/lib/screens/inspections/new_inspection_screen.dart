import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import '../../models/inspection.dart';
import '../../models/room.dart';
import '../../providers/inspections_provider.dart';

class NewInspectionScreen extends ConsumerStatefulWidget {
  const NewInspectionScreen({super.key});

  @override
  ConsumerState<NewInspectionScreen> createState() => _NewInspectionScreenState();
}

class _NewInspectionScreenState extends ConsumerState<NewInspectionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _addressController = TextEditingController();
  final _clientController = TextEditingController();
  final _inspectorController = TextEditingController(text: 'Jane Inspector');
  DateTime _date = DateTime.now().add(const Duration(hours: 1));
  String _template = 'Standard';
  bool _isSaving = false;

  final Map<String, List<String>> _roomTemplates = {
    'Standard': ['Living Room', 'Kitchen', 'Master Bedroom', 'Bathroom', 'Garage'],
    'Condo': ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Balcony'],
    'Commercial': ['Reception', 'Main Floor', 'Restrooms', 'Storage', 'HVAC Room', 'Electrical Room'],
    'Custom': [],
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Inspection'),
        leading: IconButton(icon: const Icon(Icons.close, color: Colors.white), onPressed: () => context.pop()),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Property Address *', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(hintText: 'Enter full property address'),
              validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            const Text('Client Name *', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _clientController,
              decoration: const InputDecoration(hintText: 'Enter client or buyer name'),
              validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            const Text('Inspector', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _inspectorController,
              decoration: const InputDecoration(hintText: 'Inspector name'),
            ),
            const SizedBox(height: 16),
            const Text('Scheduled Date & Time', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            InkWell(
              onTap: _pickDateTime,
              child: InputDecorator(
                decoration: const InputDecoration(),
                child: Text(DateFormat('EEE, MMMM d, yyyy  h:mm a').format(_date)),
              ),
            ),
            const SizedBox(height: 20),
            const Text('Room Template', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ...(_roomTemplates.keys.map((tmpl) => RadioListTile<String>(
                  title: Text(tmpl),
                  subtitle: tmpl != 'Custom'
                      ? Text(_roomTemplates[tmpl]!.join(', '), style: const TextStyle(fontSize: 12))
                      : const Text('Define your own rooms after creating'),
                  value: tmpl,
                  groupValue: _template,
                  onChanged: (v) => setState(() => _template = v!),
                  dense: true,
                ))),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isSaving ? null : _create,
              style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
              child: _isSaving
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('CREATE INSPECTION', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(_date));
    if (time == null) return;
    setState(() => _date = DateTime(date.year, date.month, date.day, time.hour, time.minute));
  }

  Future<void> _create() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    try {
      final rooms = (_roomTemplates[_template] ?? []).map((name) {
        return Room(
          id: const Uuid().v4(),
          inspectionId: '',
          name: name,
          condition: RoomCondition.good,
          items: [],
          photos: [],
          notes: '',
          isCompleted: false,
        );
      }).toList();

      final inspectionId = const Uuid().v4();
      final roomsWithInspectionId = rooms.map((r) => Room(
        id: r.id,
        inspectionId: inspectionId,
        name: r.name,
        condition: r.condition,
        items: r.items,
        photos: r.photos,
        notes: r.notes,
        isCompleted: r.isCompleted,
      )).toList();

      final inspection = Inspection(
        id: inspectionId,
        propertyAddress: _addressController.text.trim(),
        clientName: _clientController.text.trim(),
        date: _date,
        inspectorName: _inspectorController.text.trim(),
        status: InspectionStatus.scheduled,
        rooms: roomsWithInspectionId,
        overallCondition: OverallCondition.good,
      );

      await ref.read(inspectionsProvider.notifier).addInspection(inspection);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Inspection created!'), backgroundColor: Colors.green),
        );
        context.pushReplacement('/inspections/${inspection.id}');
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
