import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../screens/home/home_screen.dart';
import '../screens/diagnose/diagnose_screen.dart';
import '../screens/diagnose/diagnosis_result_screen.dart';
import '../screens/guides/guides_screen.dart';
import '../screens/guides/guide_detail_screen.dart';
import '../screens/parts/parts_screen.dart';
import '../screens/safety/safety_screen.dart';
import '../screens/history/history_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../models/diagnosis.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/home',
    debugLogDiagnostics: false,
    routes: [
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/home',
            name: 'home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/diagnose',
            name: 'diagnose',
            builder: (context, state) => const DiagnoseScreen(),
            routes: [
              GoRoute(
                path: 'result',
                name: 'diagnosis-result',
                builder: (context, state) {
                  final diagnosis = state.extra as Diagnosis?;
                  return DiagnosisResultScreen(diagnosis: diagnosis);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/guides',
            name: 'guides',
            builder: (context, state) => const GuidesScreen(),
            routes: [
              GoRoute(
                path: ':id',
                name: 'guide-detail',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return GuideDetailScreen(guideId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/parts',
            name: 'parts',
            builder: (context, state) => const PartsScreen(),
          ),
          GoRoute(
            path: '/safety',
            name: 'safety',
            builder: (context, state) => const SafetyScreen(),
          ),
          GoRoute(
            path: '/history',
            name: 'history',
            builder: (context, state) => const HistoryScreen(),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
  );
});

class MainShell extends StatefulWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _selectedIndex = 0;

  final _navItems = const [
    _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home, label: 'Home', path: '/home'),
    _NavItem(icon: Icons.camera_alt_outlined, activeIcon: Icons.camera_alt, label: 'Diagnose', path: '/diagnose'),
    _NavItem(icon: Icons.menu_book_outlined, activeIcon: Icons.menu_book, label: 'Guides', path: '/guides'),
    _NavItem(icon: Icons.build_outlined, activeIcon: Icons.build, label: 'Parts', path: '/parts'),
    _NavItem(icon: Icons.health_and_safety_outlined, activeIcon: Icons.health_and_safety, label: 'Safety', path: '/safety'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
          context.go(_navItems[index].path);
        },
        destinations: _navItems.map((item) => NavigationDestination(
          icon: Icon(item.icon),
          selectedIcon: Icon(item.activeIcon),
          label: item.label,
        )).toList(),
        backgroundColor: const Color(0xFF1C1917),
        indicatorColor: const Color(0xFFFBBF24).withOpacity(0.2),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(color: Color(0xFFFBBF24), fontSize: 12, fontWeight: FontWeight.w600);
          }
          return const TextStyle(color: Colors.grey, fontSize: 12);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: Color(0xFFFBBF24));
          }
          return const IconThemeData(color: Colors.grey);
        }),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String path;
  const _NavItem({required this.icon, required this.activeIcon, required this.label, required this.path});
}
