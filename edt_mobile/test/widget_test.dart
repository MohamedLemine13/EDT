import 'package:flutter_test/flutter_test.dart';
import 'package:edt_mobile/main.dart';

void main() {
  testWidgets('App starts on login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const EdtApp());
    expect(find.text('EDT Mobile'), findsOneWidget);
    expect(find.text('Se connecter'), findsOneWidget);
  });
}
