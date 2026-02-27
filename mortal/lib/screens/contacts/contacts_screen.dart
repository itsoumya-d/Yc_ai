import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/planning_provider.dart';
import '../../models/contact.dart';
import '../../theme/app_theme.dart';

class ContactsScreen extends ConsumerWidget {
  const ContactsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final planning = ref.watch(planningProvider);
    final contacts = planning.contacts;

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(
        title: const Text('Important Contacts'),
        backgroundColor: const Color(0xFFD97706),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddContactSheet(context, ref),
        backgroundColor: const Color(0xFFD97706),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Contact', style: TextStyle(color: Colors.white)),
      ),
      body: contacts.isEmpty
          ? _EmptyView(onAdd: () => _showAddContactSheet(context, ref))
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: contacts.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final contact = contacts[index];
                return _ContactCard(
                  contact: contact,
                  onDelete: () => ref.read(planningProvider.notifier).removeContact(contact.id),
                );
              },
            ),
    );
  }

  void _showAddContactSheet(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final emailController = TextEditingController();
    final notesController = TextEditingController();
    ContactRole selectedRole = ContactRole.attorney;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Add Contact', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                DropdownButtonFormField<ContactRole>(
                  value: selectedRole,
                  decoration: const InputDecoration(labelText: 'Role'),
                  onChanged: (v) => setState(() => selectedRole = v!),
                  items: ContactRole.values.map((r) {
                    return DropdownMenuItem(value: r, child: Text(r.label));
                  }).toList(),
                ),
                const SizedBox(height: 12),
                TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Full Name')),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Phone'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: notesController,
                  decoration: const InputDecoration(labelText: 'Notes (optional)'),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    if (nameController.text.isEmpty) return;
                    ref.read(planningProvider.notifier).addContact(
                      ImportantContact(
                        id: DateTime.now().millisecondsSinceEpoch.toString(),
                        name: nameController.text,
                        role: selectedRole,
                        phone: phoneController.text.isEmpty ? null : phoneController.text,
                        email: emailController.text.isEmpty ? null : emailController.text,
                        notes: notesController.text.isEmpty ? null : notesController.text,
                      ),
                    );
                    Navigator.pop(context);
                  },
                  child: const Text('Add Contact'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ContactCard extends StatelessWidget {
  final ImportantContact contact;
  final VoidCallback onDelete;

  const _ContactCard({required this.contact, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE7E5E4)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: const Color(0xFFD97706).withOpacity(0.15),
            child: Text(
              contact.name[0].toUpperCase(),
              style: const TextStyle(color: Color(0xFFD97706), fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(contact.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                Text(contact.role.label, style: const TextStyle(fontSize: 12, color: Color(0xFFD97706))),
                if (contact.phone != null)
                  Text(contact.phone!, style: const TextStyle(fontSize: 12, color: AppTheme.warmBrown)),
                if (contact.email != null)
                  Text(contact.email!, style: const TextStyle(fontSize: 12, color: AppTheme.warmBrown)),
              ],
            ),
          ),
          GestureDetector(
            onTap: onDelete,
            child: const Icon(Icons.delete_outline, color: Color(0xFFEF4444), size: 20),
          ),
        ],
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  final VoidCallback onAdd;

  const _EmptyView({required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.contacts_outlined, size: 72, color: Color(0xFFD6D3D1)),
          const SizedBox(height: 16),
          const Text('No contacts added', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          const Text(
            'Add attorneys, doctors, executors,\nand key family members',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppTheme.warmBrown),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add),
            label: const Text('Add Contact'),
            style: ElevatedButton.styleFrom(minimumSize: const Size(200, 48)),
          ),
        ],
      ),
    );
  }
}
