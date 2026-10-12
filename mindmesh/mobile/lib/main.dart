// ============================================================================
// MindMesh Mobile - Main Application Entrypoint
// Single Codebase for Android (Provider) & iOS (Volunteer)
// ============================================================================

import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'services/supabase_service.dart';
import 'theme/mindmesh_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize service with Supabase credentials
  const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://thhvpvsimrjbdrszuywk.supabase.co',
  );
  const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoaHZwdnNpbXJqYmRyc3p1eXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNjk0OTMsImV4cCI6MjEwNjg0NTQ5M30.EZBYLNL_8y9bwRvX04pOAvFdw4mPKiJu7_ZuEqW_aNE',
  );

  final service = MindMeshService();
  if (supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty) {
    await service.initSupabase(url: supabaseUrl, anonKey: supabaseAnonKey);
  }

  runApp(const MindMeshApp());
}

class MindMeshApp extends StatelessWidget {
  const MindMeshApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MindMesh',
      debugShowCheckedModeBanner: false,
      theme: MindMeshTheme.lightTheme,
      home: const LoginScreen(),
    );
  }
}
