import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/reports/reports_screen.dart';
import '../screens/reports/new_report_screen.dart';
import '../screens/reports/report_detail_screen.dart';
import '../screens/photos/photos_screen.dart';
import '../screens/punch_list/punch_list_screen.dart';
import '../screens/punch_list/add_punch_item_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/dashboard',
    routes: [
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/reports',
            builder: (context, state) => const ReportsScreen(),
          ),
          GoRoute(
            path: '/photos',
            builder: (context, state) => const PhotosScreen(),
          ),
          GoRoute(
            path: '/punch-list',
            builder: (context, state) => const PunchListScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/new-report',
        builder: (context, state) => const NewReportScreen(),
      ),
      GoRoute(
        path: '/reports/:id',
        builder: (context, state) =>
            ReportDetailScreen(reportId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/add-punch-item',
        builder: (context, state) => const AddPunchItemScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.uri}'),
      ),
    ),
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

  final List<({String path, String label, IconData icon})> _destinations = [
    (path: '/dashboard', label: 'Dashboard', icon: Icons.dashboard_rounded),
    (path: '/reports', label: 'Reports', icon: Icons.article_rounded),
    (path: '/photos', label: 'Photos', icon: Icons.photo_library_rounded),
    (path: '/punch-list', label: 'Punch List', icon: Icons.checklist_rounded),
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
            .map((d) => NavigationDestination(
                  icon: Icon(d.icon),
                  label: d.label,
                ))
            .toList(),
      ),
    );
  }
}
