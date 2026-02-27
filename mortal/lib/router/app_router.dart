import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/auth/login_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/will/will_screen.dart';
import '../screens/directives/directives_screen.dart';
import '../screens/digital_assets/digital_assets_screen.dart';
import '../screens/contacts/contacts_screen.dart';
import '../screens/funeral/funeral_screen.dart';
import '../screens/vault/vault_screen.dart';

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
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/will',
      builder: (context, state) => const WillScreen(),
    ),
    GoRoute(
      path: '/directives',
      builder: (context, state) => const DirectivesScreen(),
    ),
    GoRoute(
      path: '/digital-assets',
      builder: (context, state) => const DigitalAssetsScreen(),
    ),
    GoRoute(
      path: '/contacts',
      builder: (context, state) => const ContactsScreen(),
    ),
    GoRoute(
      path: '/funeral',
      builder: (context, state) => const FuneralScreen(),
    ),
    GoRoute(
      path: '/vault',
      builder: (context, state) => const VaultScreen(),
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('Page not found'),
          ElevatedButton(
            onPressed: () => context.go('/home'),
            child: const Text('Go Home'),
          ),
        ],
      ),
    ),
  ),
);
