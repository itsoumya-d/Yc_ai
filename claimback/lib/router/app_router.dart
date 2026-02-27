import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/auth/login_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/claims/new_claim_screen.dart';
import '../screens/claims/claim_detail_screen.dart';
import '../screens/claims/claim_list_screen.dart';
import '../screens/templates/templates_screen.dart';
import '../screens/templates/template_detail_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/',
      redirect: (_, __) => '/login',
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: '/new-claim',
      builder: (context, state) => const NewClaimScreen(),
    ),
    GoRoute(
      path: '/claims',
      builder: (context, state) => const ClaimListScreen(),
    ),
    GoRoute(
      path: '/claims/:id',
      builder: (context, state) => ClaimDetailScreen(
        claimId: state.pathParameters['id']!,
      ),
    ),
    GoRoute(
      path: '/templates',
      builder: (context, state) => const TemplatesScreen(),
    ),
    GoRoute(
      path: '/templates/:id',
      builder: (context, state) => TemplateDetailScreen(
        templateId: state.pathParameters['id']!,
      ),
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('Page not found'),
          ElevatedButton(
            onPressed: () => context.go('/dashboard'),
            child: const Text('Go to Dashboard'),
          ),
        ],
      ),
    ),
  ),
);
