import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            color: const Color(0xFF1C1917),
            child: Column(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFBBF24),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: const Icon(Icons.person, size: 44, color: Color(0xFF1C1917)),
                ),
                const SizedBox(height: 12),
                const Text('Field Tech', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                Text(
                  authState.user?.email ?? 'Not signed in',
                  style: const TextStyle(color: Colors.white60, fontSize: 13),
                ),
              ],
            ),
          ),
          const _Section('Trade Preferences'),
          _Tile(icon: Icons.build, title: 'Primary Trade', subtitle: 'Plumbing', onTap: () {}),
          _Tile(icon: Icons.star_outline, title: 'Experience Level', subtitle: 'Journeyman', onTap: () {}),
          const _Section('Settings'),
          _Tile(icon: Icons.notifications_outlined, title: 'Notifications', onTap: () {}),
          _Tile(icon: Icons.language, title: 'Language', subtitle: 'English', onTap: () {}),
          _Tile(icon: Icons.dark_mode_outlined, title: 'Appearance', subtitle: 'System default', onTap: () {}),
          const _Section('Support'),
          _Tile(icon: Icons.help_outline, title: 'Help & Feedback', onTap: () {}),
          _Tile(icon: Icons.privacy_tip_outlined, title: 'Privacy Policy', onTap: () {}),
          _Tile(
            icon: Icons.logout,
            title: 'Sign Out',
            textColor: const Color(0xFFEF4444),
            onTap: () => ref.read(authProvider.notifier).signOut(),
          ),
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
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFFF59E0B), letterSpacing: 1.2),
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
      leading: Icon(icon, color: textColor ?? const Color(0xFFF59E0B)),
      title: Text(title, style: TextStyle(fontWeight: FontWeight.w500, color: textColor)),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      trailing: onTap != null ? const Icon(Icons.chevron_right, color: Colors.grey) : null,
      onTap: onTap,
    );
  }
}
