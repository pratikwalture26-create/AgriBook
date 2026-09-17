import 'package:flutter/material.dart';
import '../models/centre.dart';
import '../services/api_service.dart';

class OperatorScreen extends StatefulWidget {
  const OperatorScreen({Key? key}) : super(key: key);

  @override
  State<OperatorScreen> createState() => _OperatorScreenState();
}

class _OperatorScreenState extends State<OperatorScreen> {
  List<ProcurementCentre> _centres = [];
  ProcurementCentre? _selectedCentre;
  List<dynamic> _tokens = [];
  int _queueDepth = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCentres();
  }

  Future<void> _loadCentres() async {
    setState(() => _isLoading = true);
    final centres = await ApiService.getCentres();
    setState(() {
      _centres = centres;
      if (centres.isNotEmpty) {
        _selectedCentre = centres.first;
      }
      _isLoading = false;
    });
    if (_selectedCentre != null) {
      _fetchQueue(_selectedCentre!.id);
    }
  }

  Future<void> _fetchQueue(String centreId) async {
    final data = await ApiService.getLiveQueue(centreId);
    setState(() {
      _queueDepth = data['activeQueueDepth'] ?? 0;
      _tokens = data['tokens'] ?? [];
    });
  }

  Future<void> _callNext() async {
    if (_selectedCentre == null) return;
    final res = await ApiService.operatorCallNext(_selectedCentre!.id);
    if (res != null && res['calledToken'] != null) {
      final token = res['calledToken'];
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF065F46),
            content: Text('Called Token ${token['tokenNumber']} (${token['farmerName']}) to Weighbridge!'),
          ),
        );
        _fetchQueue(_selectedCentre!.id);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: Color(0xFF065F46))),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Operator Mandi Terminal'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Mandi Selector
            DropdownButtonFormField<ProcurementCentre>(
              value: _selectedCentre,
              decoration: InputDecoration(
                labelText: 'Active Mandi Yard',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              items: _centres.map((c) {
                return DropdownMenuItem(
                  value: c,
                  child: Text('${c.name} (${c.district})', style: const TextStyle(fontSize: 12)),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() => _selectedCentre = val);
                  _fetchQueue(val.id);
                }
              },
            ),

            const SizedBox(height: 16),

            // Queue Depth Metric & Call Button
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Redis Active Queue',
                          style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '$_queueDepth Tokens',
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                      ],
                    ),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.volume_up),
                      label: const Text('Call Next Farmer'),
                      onPressed: _queueDepth > 0 ? _callNext : null,
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),
            const Text('Live Tokens in Queue', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),

            Expanded(
              child: _tokens.isEmpty
                  ? const Center(child: Text('No active tokens in queue', style: TextStyle(color: Colors.grey)))
                  : ListView.builder(
                      itemCount: _tokens.length,
                      itemBuilder: (ctx, i) {
                        final t = _tokens[i];
                        final isCalled = t['status'] == 'CALLED';
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: isCalled ? const Color(0xFFFEF3C7) : const Color(0xFFECFDF5),
                              child: Text(
                                t['tokenNumber'] ?? '',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isCalled ? const Color(0xFFB45309) : const Color(0xFF065F46),
                                ),
                              ),
                            ),
                            title: Text(t['farmerName'] ?? '', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                            subtitle: Text('${t['crop']} • Slot: ${t['slotTime']}', style: const TextStyle(fontSize: 11)),
                            trailing: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: isCalled ? const Color(0xFFFEF3C7) : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                t['status'] ?? 'WAITING',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isCalled ? const Color(0xFFB45309) : const Color(0xFF475569),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
