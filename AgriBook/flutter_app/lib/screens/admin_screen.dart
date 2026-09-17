import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({Key? key}) : super(key: key);

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  Map<String, dynamic>? _dashboardData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAdminData();
  }

  Future<void> _fetchAdminData() async {
    setState(() => _isLoading = true);
    final data = await ApiService.getAdminDashboard();
    setState(() {
      _dashboardData = data;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: Color(0xFF065F46))),
      );
    }

    final kpis = _dashboardData?['kpis'] ?? {};
    final centres = (_dashboardData?['centres'] as List? ?? []);

    return Scaffold(
      appBar: AppBar(
        title: const Text('State Procurement Dashboard'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _fetchAdminData),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // KPI Summary Grid
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'Registered Farmers',
                    '${kpis['totalFarmers'] ?? 10}',
                    Icons.people,
                    const Color(0xFF065F46),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Total Bookings',
                    '${kpis['totalBookings'] ?? 6}',
                    Icons.calendar_check,
                    const Color(0xFF0284C7),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'Procured Quintals',
                    '${kpis['totalProcuredQuintals'] ?? 125} Qtl',
                    Icons.scale,
                    const Color(0xFFD97706),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Live Queue Depth',
                    '${kpis['totalActiveQueues'] ?? 117}',
                    Icons.hourglass_top,
                    const Color(0xFFDC2626),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),
            const Text(
              'Centres Capacity & Predicted Demand (XGBoost)',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            ...centres.map((c) {
              final isHigh = c['congestionLevel'] == 'HIGH' || (c['loadPercent'] ?? 0) > 85;
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          Text(
                            c['name'] ?? '',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: isHigh ? const Color(0xFFFEE2E2) : const Color(0xFFDCFCE7),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              isHigh ? 'HIGH CONGESTION' : 'NORMAL',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: isHigh ? const Color(0xFF991B1B) : const Color(0xFF166534),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Daily Cap: ${c['dailyCapacity']} • Current Queue: ${c['currentQueue']} • Predicted: ${c['predictedDemand']}',
                        style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 8),
                      LinearProgressIndicator(
                        value: ((c['loadPercent'] ?? 0) / 100).clamp(0.0, 1.0),
                        backgroundColor: const Color(0xFFE2E8F0),
                        color: isHigh ? const Color(0xFFDC2626) : const Color(0xFF059669),
                        minHeight: 6,
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
            const SizedBox(height: 2),
            Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
