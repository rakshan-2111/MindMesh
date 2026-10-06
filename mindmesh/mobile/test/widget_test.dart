import 'package:flutter_test/flutter_test.dart';
import 'package:mindmesh_mobile/main.dart';

void main() {
  testWidgets('MindMesh App smoke test and role chooser render', (WidgetTester tester) async {
    await tester.pumpWidget(const MindMeshApp());
    expect(find.text('MindMesh'), findsOneWidget);
    expect(find.text('SELECT DEVICE CLIENT ROLE'), findsOneWidget);
  });
}
