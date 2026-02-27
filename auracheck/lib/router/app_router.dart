import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../screens/home/home_screen.dart';
import '../screens/check/check_screen.dart';
import '../screens/spots/spots_screen.dart';
import '../screens/spots/spot_detail_screen.dart';
import '../screens/spots/add_spot_screen.dart';
import '../screens/history/history_screen.dart';
import '../screens/insights/insights_screen.dart';
import '../screens/settings/settings_screen.dart';

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
            path: '/check',
            name: 'check',
            builder: (context, state) => const CheckScreen(),
          ),
          GoRoute(
            path: '/spots',
            name: 'spots',
            builder: (context, state) => const SpotsScreen(),
            routes: [
              GoRoute(
                path: 'add',
                name: 'add-spot',
                builder: (context, state) => const AddSpotScreen(),
              ),
              GoRoute(
                path: ':id',
                name: 'spot-detail',
                builder: (context, state) => SpotDetailScreen(spotId: state.pathParameters['id']!),
              ),
            ],
          ),
          GoRoute(
            path: '/history',
            name: 'history',
            builder: (context, state) => const HistoryScreen(),
          ),
          GoRoute(
            path: '/insights',
            name: 'insights',
            builder: (context, state) => const InsightsScreen(),
          ),
          GoRoute(
            path: '/settings',
            name: 'settings',
            builder: (context, state) => const SettingsScreen(),
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
    _NavItem(icon: Icons.check_circle_outline, activeIcon: Icons.check_circle, label: 'Check', path: '/check'),
    _NavItem(icon: Icons.bubble_chart_outlined, activeIcon: Icons.bubble_chart, label: 'Spots', path: '/spots'),
    _NavItem(icon: Icons.insights_outlined, activeIcon: Icons.insights, label: 'Insights', path: '/insights'),
    _NavItem(icon: Icons.history_outlined, activeIcon: Icons.history, label: 'History', path: '/history'),
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
        backgroundColor: Colors.white,
        indicatorColor: const Color(0xFFFECDD3),
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
