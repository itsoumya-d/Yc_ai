import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/inspections/inspections_screen.dart';
import '../screens/inspections/new_inspection_screen.dart';
import '../screens/inspections/inspection_screen.dart';
import '../screens/violations/violations_screen.dart';
import '../screens/reports/reports_screen.dart';
import '../screens/facilities/facilities_screen.dart';
import '../screens/facilities/facility_detail_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final isAuthenticated = ref.watch(isAuthenticatedProvider);

  return GoRouter(
    initialLocation: isAuthenticated ? '/dashboard' : '/login',
    redirect: (context, state) {
      final loggedIn = ref.read(isAuthenticatedProvider);
      final isLoginPage = state.matchedLocation == '/login';
      if (!loggedIn && !isLoginPage) return '/login';
      if (loggedIn && isLoginPage) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/dashboard', builder: (context, state) => const DashboardScreen()),
          GoRoute(path: '/inspections', builder: (context, state) => const InspectionsScreen()),
          GoRoute(path: '/violations', builder: (context, state) => const ViolationsScreen()),
          GoRoute(path: '/reports', builder: (context, state) => const ReportsScreen()),
          GoRoute(path: '/facilities', builder: (context, state) => const FacilitiesScreen()),
        ],
      ),
      GoRoute(path: '/new-inspection', builder: (context, state) => const NewInspectionScreen()),
      GoRoute(path: '/inspections/:id', builder: (context, state) => InspectionScreen(inspectionId: state.pathParameters['id']!)),
      GoRoute(path: '/facilities/:id', builder: (context, state) => FacilityDetailScreen(facilityId: state.pathParameters['id']!)),
    ],
    errorBuilder: (context, state) => Scaffold(body: Center(child: Text('Not found: ${state.uri}'))),
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

  final _destinations = [
    (path: '/dashboard', label: 'Dashboard', icon: Icons.dashboard_rounded),
    (path: '/inspections', label: 'Inspections', icon: Icons.checklist_rounded),
    (path: '/violations', label: 'Violations', icon: Icons.warning_amber_rounded),
    (path: '/reports', label: 'Reports', icon: Icons.bar_chart_rounded),
    (path: '/facilities', label: 'Facilities', icon: Icons.business_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
          context.go(_destinations[index].path);
        },
        destinations: _destinations
            .map((d) => NavigationDestination(icon: Icon(d.icon), label: d.label))
            .toList(),
      ),
    );
  }
}
