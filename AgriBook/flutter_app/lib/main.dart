import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'screens/farmer_home_screen.dart';
import 'screens/operator_screen.dart';
import 'screens/admin_screen.dart';

void main() {
  runApp(const AgriBookApp());
}

class AgriBookApp extends StatelessWidget {
  const AgriBookApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AgriBook',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({Key? key}) : super(key: key);

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    FarmerHomeScreen(),
    OperatorScreen(),
    AdminScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.agriculture_outlined),
            selectedIcon: Icon(Icons.agriculture, color: Color(0xFF065F46)),
            label: 'Farmer App',
          ),
          NavigationDestination(
            icon: Icon(Icons.store_mall_directory_outlined),
            selectedIcon: Icon(Icons.store_mall_directory, color: Color(0xFF065F46)),
            label: 'Mandi Operator',
          ),
          NavigationDestination(
            icon: Icon(Icons.analytics_outlined),
            selectedIcon: Icon(Icons.analytics, color: Color(0xFF065F46)),
            label: 'Admin Oversight',
          ),
        ],
      ),
    );
  }
}
