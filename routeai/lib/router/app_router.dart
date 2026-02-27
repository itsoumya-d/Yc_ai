import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/route/route_screen.dart';
import '../screens/jobs/jobs_screen.dart';
import '../screens/jobs/job_detail_screen.dart';
import '../screens/jobs/add_job_screen.dart';
import '../screens/drivers/drivers_screen.dart';
import '../screens/dispatch/dispatch_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/dashboard',
    routes: [
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/dashboard', builder: (context, state) => const DashboardScreen()),
          GoRoute(path: '/route', builder: (context, state) => const RouteScreen()),
          GoRoute(path: '/jobs', builder: (context, state) => const JobsScreen()),
          GoRoute(path: '/drivers', builder: (context, state) => const DriversScreen()),
          GoRoute(path: '/dispatch', builder: (context, state) => const DispatchScreen()),
        ],
      ),
      GoRoute(path: '/jobs/:id', builder: (context, state) => JobDetailScreen(jobId: state.pathParameters['id']!)),
      GoRoute(path: '/add-job', builder: (context, state) => const AddJobScreen()),
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
    (path: '/route', label: 'My Route', icon: Icons.route_rounded),
    (path: '/jobs', label: 'Jobs', icon: Icons.work_rounded),
    (path: '/drivers', label: 'Drivers', icon: Icons.local_shipping_rounded),
    (path: '/dispatch', label: 'Dispatch', icon: Icons.send_rounded),
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
