import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/signup_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/search/search_screen.dart';
import '../screens/services/service_detail_screen.dart';
import '../screens/applications/my_applications_screen.dart';
import '../screens/applications/add_application_screen.dart';
import '../screens/profile/profile_screen.dart';

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
      path: '/signup',
      builder: (context, state) => const SignupScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/search',
      builder: (context, state) => const SearchScreen(),
    ),
    GoRoute(
      path: '/services/:id',
      builder: (context, state) => ServiceDetailScreen(
        serviceId: state.pathParameters['id']!,
      ),
    ),
    GoRoute(
      path: '/my-applications',
      builder: (context, state) => const MyApplicationsScreen(),
    ),
    GoRoute(
      path: '/my-applications/add',
      builder: (context, state) => const AddApplicationScreen(),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => const ProfileScreen(),
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 60, color: Colors.red),
          const SizedBox(height: 16),
          Text('Page not found: ${state.uri.toString()}'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => context.go('/home'),
            child: const Text('Go Home'),
          ),
        ],
      ),
    ),
  ),
);
