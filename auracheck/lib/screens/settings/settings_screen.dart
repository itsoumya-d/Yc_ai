import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          // Profile header
          Container(
            padding: const EdgeInsets.all(20),
            color: Colors.white,
            child: Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFFE11D48), Color(0xFFFB923C)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.person, color: Colors.white, size: 30),
                ),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('My Profile', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                    Text(authState.user?.email ?? 'Not signed in', style: const TextStyle(color: Colors.grey, fontSize: 13)),
                  ],
                ),
              ],
            ),
          ),

          _Section('Reminders'),
          _SwitchTile(icon: Icons.alarm, title: 'Daily Check Reminder', subtitle: '8:00 AM every day', initialValue: true),
          _SwitchTile(icon: Icons.notifications_outlined, title: 'Weekly Summary', subtitle: 'Sent every Sunday', initialValue: true),
          _SwitchTile(icon: Icons.local_hospital_outlined, title: 'Dermatologist Reminders', subtitle: 'High-risk spot alerts', initialValue: true),

          _Section('Privacy & Data'),
          _Tile(icon: Icons.lock_outlined, title: 'Data Encryption', subtitle: 'All photos encrypted at rest', onTap: null),
          _Tile(icon: Icons.delete_outline, title: 'Delete All Data', subtitle: 'Remove all spots and photos', onTap: () => _confirmDelete(context), textColor: Colors.red),
          _Tile(icon: Icons.download_outlined, title: 'Export My Data', onTap: () {}),

          _Section('Appearance'),
          _SwitchTile(icon: Icons.dark_mode_outlined, title: 'Dark Mode', initialValue: false),

          _Section('About'),
          _Tile(icon: Icons.info_outline, title: 'Version', subtitle: '1.0.0'),
          _Tile(icon: Icons.shield_outlined, title: 'Privacy Policy', onTap: () {}),
          _Tile(icon: Icons.description_outlined, title: 'Terms of Service', onTap: () {}),
          _Tile(icon: Icons.medical_information_outlined, title: 'Medical Disclaimer', onTap: () => _showDisclaimer(context)),

          _Section('Account'),
          _Tile(
            icon: Icons.logout,
            title: 'Sign Out',
            textColor: const Color(0xFFE11D48),
            onTap: () => ref.read(authProvider.notifier).signOut(),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete All Data?'),
        content: const Text('This will permanently delete all your tracked spots, photos, and check history. This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, minimumSize: const Size(80, 40)),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _showDisclaimer(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Medical Disclaimer'),
        content: const SingleChildScrollView(
          child: Text(
            'AuraCheck is not a medical device and does not provide medical diagnoses. The AI analysis is for informational purposes only and should not replace professional medical advice.\n\nAlways consult a qualified dermatologist or healthcare provider for evaluation of skin changes, moles, or any skin concerns. If you notice any unusual changes, seek medical attention promptly.',
            style: TextStyle(height: 1.5),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('I Understand')),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  const _Section(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 4),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFFE11D48), letterSpacing: 1.2),
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback? onTap;
  final Color? textColor;

  const _Tile({required this.icon, required this.title, this.subtitle, this.onTap, this.textColor});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: textColor ?? const Color(0xFFE11D48)),
      title: Text(title, style: TextStyle(fontWeight: FontWeight.w500, color: textColor)),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      trailing: onTap != null ? const Icon(Icons.chevron_right, color: Colors.grey) : null,
      onTap: onTap,
    );
  }
}

class _SwitchTile extends StatefulWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final bool initialValue;

  const _SwitchTile({required this.icon, required this.title, this.subtitle, required this.initialValue});

  @override
  State<_SwitchTile> createState() => _SwitchTileState();
}

class _SwitchTileState extends State<_SwitchTile> {
  late bool _value;

  @override
  void initState() {
    super.initState();
    _value = widget.initialValue;
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(widget.icon, color: const Color(0xFFE11D48)),
      title: Text(widget.title, style: const TextStyle(fontWeight: FontWeight.w500)),
      subtitle: widget.subtitle != null ? Text(widget.subtitle!) : null,
      trailing: Switch(
        value: _value,
        onChanged: (v) => setState(() => _value = v),
        activeColor: const Color(0xFFE11D48),
      ),
    );
  }
}
