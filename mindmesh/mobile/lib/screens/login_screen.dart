// ============================================================================
// MindMesh Mobile - Sign in & Role Gateway
// Production Editorial / Utilitarian Theme
// ============================================================================

import 'package:flutter/material.dart';
import '../services/supabase_service.dart';
import '../theme/mindmesh_theme.dart';
import 'main_navigation_shell.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  String _selectedRole = 'provider'; // 'provider' or 'volunteer'
  final _emailController = TextEditingController(text: 'canteen.a@christ.edu');
  final _passwordController = TextEditingController(text: 'pass123');
  bool _obscurePassword = true;
  bool _isLoading = false;

  void _switchRole(String role) {
    setState(() {
      _selectedRole = role;
      if (role == 'provider') {
        _emailController.text = 'canteen.a@christ.edu';
      } else {
        _emailController.text = 'ravi.kumar@mindmesh.org';
      }
    });
  }

  void _handleSignIn() {
    setState(() => _isLoading = true);
    final service = MindMeshService();
    service.sendDeviceHeartbeat(_selectedRole);
    service.fetchInitialData();

    Future.delayed(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      setState(() => _isLoading = false);

      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => MainNavigationShell(role: _selectedRole),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final isProvider = _selectedRole == 'provider';

    return Scaffold(
      backgroundColor: MindMeshColors.canvas,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo wordmark
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: const BoxDecoration(
                          color: MindMeshColors.brand,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'MindMesh',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: MindMeshColors.ink,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Food rescue logistics platform',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      color: MindMeshColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Role Segmented Control (Provider vs Volunteer)
                  Container(
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(
                      color: MindMeshColors.subtleFill,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: MindMeshColors.border),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => _switchRole('provider'),
                            child: Container(
                              height: 36,
                              decoration: BoxDecoration(
                                color: isProvider ? Colors.white : Colors.transparent,
                                borderRadius: BorderRadius.circular(6),
                                boxShadow: isProvider
                                    ? [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.05),
                                          blurRadius: 2,
                                          offset: const Offset(0, 1),
                                        ),
                                      ]
                                    : null,
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                'Food Provider',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: isProvider ? FontWeight.w600 : FontWeight.w500,
                                  color: isProvider ? MindMeshColors.ink : MindMeshColors.textSecondary,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => _switchRole('volunteer'),
                            child: Container(
                              height: 36,
                              decoration: BoxDecoration(
                                color: !isProvider ? Colors.white : Colors.transparent,
                                borderRadius: BorderRadius.circular(6),
                                boxShadow: !isProvider
                                    ? [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.05),
                                          blurRadius: 2,
                                          offset: const Offset(0, 1),
                                        ),
                                      ]
                                    : null,
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                'Volunteer Courier',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: !isProvider ? FontWeight.w600 : FontWeight.w500,
                                  color: !isProvider ? MindMeshColors.ink : MindMeshColors.textSecondary,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Input Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: MindMeshColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Email label + input
                        const Text(
                          'Email address',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: MindMeshColors.ink,
                          ),
                        ),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          style: const TextStyle(fontSize: 13, color: MindMeshColors.ink),
                          decoration: const InputDecoration(
                            hintText: 'name@organization.com',
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Password label + input
                        const Text(
                          'Password',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: MindMeshColors.ink,
                          ),
                        ),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          style: const TextStyle(fontSize: 13, color: MindMeshColors.ink),
                          decoration: InputDecoration(
                            hintText: 'Enter password',
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                                size: 18,
                                color: MindMeshColors.textTertiary,
                              ),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Primary Sign In Button (44px height)
                        SizedBox(
                          height: 44,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _handleSignIn,
                            child: _isLoading
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : Text('Sign in as ${isProvider ? "Provider" : "Courier"}'),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  const SizedBox(height: 16),
                  const Center(
                    child: Text(
                      'Live distribution network active',
                      style: TextStyle(
                        fontSize: 11,
                        color: MindMeshColors.textTertiary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
