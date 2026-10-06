// ============================================================================
// MindMesh Mobile - Role Selection & Demo Login Screen
// Easily toggles between Android Provider Mode and iPhone Volunteer Mode
// ============================================================================

import 'package:flutter/material.dart';
import '../services/supabase_service.dart';
import 'provider/provider_dashboard_screen.dart';
import 'volunteer/volunteer_dashboard_screen.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final service = MindMeshService();

    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo & Title
              Center(
                child: Container(
                  width: 68,
                  height: 68,
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: const Color(0xFF10B981).withOpacity(0.3),
                      width: 1.5,
                    ),
                  ),
                  child: const Icon(
                    Icons.auto_awesome,
                    color: Color(0xFF10B981),
                    size: 36,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Center(
                child: Text(
                  'MindMesh',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              const SizedBox(height: 6),
              const Center(
                child: Text(
                  'Distributed Food Redistribution & Route Optimization',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Color(0xFFA1A1AA),
                    fontSize: 13,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF18181B),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF27272A)),
                  ),
                  child: const Text(
                    'DAA Final Project Demo Client',
                    style: TextStyle(
                      color: Color(0xFF10B981),
                      fontSize: 11,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 48),

              const Text(
                'SELECT DEVICE CLIENT ROLE',
                style: TextStyle(
                  color: Color(0xFF71717A),
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 12),

              // Option 1: Android Provider
              _RoleCard(
                title: 'Android Phone: Food Provider',
                subtitle: 'Restaurant / Canteen posting surplus batches',
                badgeText: 'PROVIDER',
                badgeColor: const Color(0xFFF59E0B),
                icon: Icons.storefront_rounded,
                onTap: () {
                  service.currentRole = 'provider';
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const ProviderDashboardScreen(),
                    ),
                  );
                },
              ),
              const SizedBox(height: 14),

              // Option 2: iPhone Volunteer
              _RoleCard(
                title: 'iPhone: Volunteer Courier',
                subtitle: 'Collects donations & delivers to NGOs/Shelters',
                badgeText: 'VOLUNTEER',
                badgeColor: const Color(0xFF6366F1),
                icon: Icons.two_wheeler_rounded,
                onTap: () {
                  service.currentRole = 'volunteer';
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const VolunteerDashboardScreen(),
                    ),
                  );
                },
              ),
              const SizedBox(height: 32),

              const Text(
                'Supabase Realtime & Offline Engine are both active for reliable university presentation.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Color(0xFF52525B),
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String badgeText;
  final Color badgeColor;
  final IconData icon;
  final VoidCallback onTap;

  const _RoleCard({
    required this.title,
    required this.subtitle,
    required this.badgeText,
    required this.badgeColor,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: const Color(0xFF18181B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF27272A)),
        ),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: badgeColor.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: badgeColor, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        badgeText,
                        style: TextStyle(
                          color: badgeColor,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: Color(0xFFA1A1AA),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: Color(0xFF71717A),
            ),
          ],
        ),
      ),
    );
  }
}
