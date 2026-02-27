import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _emailNotifications = true;
  bool _pushNotifications = true;
  bool _statusUpdates = true;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final name = user?.userMetadata?['full_name'] as String? ?? 'Guest User';
    final email = user?.email ?? 'guest@example.com';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Profile'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
      ),
      body: ListView(
        children: [
          Container(
            color: AppTheme.primaryNavy,
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 36,
                  backgroundColor: Colors.white.withOpacity(0.2),
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : 'G',
                    style: const TextStyle(
                      fontSize: 28,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  email,
                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _SectionTitle(title: 'Notification Preferences'),
          _SettingsTile(
            icon: Icons.email_outlined,
            title: 'Email Notifications',
            subtitle: 'Receive updates by email',
            trailing: Switch(
              value: _emailNotifications,
              onChanged: (v) => setState(() => _emailNotifications = v),
              activeColor: AppTheme.primaryBlue,
            ),
          ),
          _SettingsTile(
            icon: Icons.notifications_outlined,
            title: 'Push Notifications',
            subtitle: 'Receive push alerts',
            trailing: Switch(
              value: _pushNotifications,
              onChanged: (v) => setState(() => _pushNotifications = v),
              activeColor: AppTheme.primaryBlue,
            ),
          ),
          _SettingsTile(
            icon: Icons.update_outlined,
            title: 'Status Updates',
            subtitle: 'Get notified on status changes',
            trailing: Switch(
              value: _statusUpdates,
              onChanged: (v) => setState(() => _statusUpdates = v),
              activeColor: AppTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 16),
          _SectionTitle(title: 'Account'),
          _SettingsTile(
            icon: Icons.person_outline,
            title: 'Edit Profile',
            subtitle: 'Update your personal information',
            onTap: () {},
          ),
          _SettingsTile(
            icon: Icons.lock_outline,
            title: 'Change Password',
            subtitle: 'Update your account password',
            onTap: () {},
          ),
          const SizedBox(height: 16),
          _SectionTitle(title: 'About'),
          _SettingsTile(
            icon: Icons.info_outline,
            title: 'About GovPass',
            subtitle: 'Version 1.0.0',
            onTap: () {},
          ),
          _SettingsTile(
            icon: Icons.privacy_tip_outlined,
            title: 'Privacy Policy',
            onTap: () {},
          ),
          _SettingsTile(
            icon: Icons.article_outlined,
            title: 'Terms of Service',
            onTap: () {},
          ),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: OutlinedButton.icon(
              onPressed: () async {
                await ref.read(authNotifierProvider.notifier).signOut();
                if (context.mounted) context.go('/login');
              },
              icon: const Icon(Icons.logout, color: AppTheme.errorRed),
              label: const Text(
                'Sign Out',
                style: TextStyle(color: AppTheme.errorRed),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppTheme.errorRed),
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 3,
        onTap: (index) {
          switch (index) {
            case 0: context.go('/home'); break;
            case 1: context.go('/search'); break;
            case 2: context.go('/my-applications'); break;
            case 3: break;
          }
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.folder_outlined), label: 'Applications'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outlined), label: 'Profile'),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: Color(0xFF64748B),
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.primaryBlue, size: 22),
      title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
      subtitle: subtitle != null
          ? Text(subtitle!, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)))
          : null,
      trailing: trailing ?? (onTap != null ? const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)) : null),
      onTap: onTap,
      tileColor: Colors.white,
    );
  }
}
