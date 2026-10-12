import 'dart:ui';
import 'package:flutter_test/flutter_test.dart';
import 'package:mindmesh_mobile/main.dart';

void main() {
  testWidgets('MindMesh App smoke test and login screen render', (WidgetTester tester) async {
    // Set surface size to avoid scroll clipping during test
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(const MindMeshApp());
    // Use bounded pump instead of pumpAndSettle because of ambient pulse animation
    await tester.pump(const Duration(milliseconds: 500));

    // Verify role toggles and production sign in inputs
    expect(find.text('Food Provider'), findsOneWidget);
    expect(find.text('Volunteer Courier'), findsOneWidget);
    expect(find.text('Email address'), findsOneWidget);
    expect(find.textContaining('Sign in as Provider'), findsOneWidget);
  });
}
