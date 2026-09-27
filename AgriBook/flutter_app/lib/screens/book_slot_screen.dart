import 'package:flutter/material.dart';
import '../models/farmer.dart';
import '../models/centre.dart';
import '../services/api_service.dart';

class BookSlotScreen extends StatefulWidget {
  final Farmer farmer;

  const BookSlotScreen({Key? key, required this.farmer}) : super(key: key);

  @override
  State<BookSlotScreen> createState() => _BookSlotScreenState();
}

class _BookSlotScreenState extends State<BookSlotScreen> {
  String _selectedCrop = 'Cotton';
  double _quantity = 40.0;
  List<ProcurementCentre> _centres = [];
  ProcurementCentre? _selectedCentre;
  String _selectedSlot = '10:00 AM – 11:00 AM';
  bool _isLoading = true;
  String? _congestedCentreWarning;

  final List<String> _crops = [
    'Cotton',
    'Soyabean',
    'Wheat',
    'Paddy',
    'Tur (Arhar)',
    'Gram (Chana)'
  ];

  @override
  void initState() {
    super.initState();
    _fetchCentresAndRecommendations();
  }

  Future<void> _fetchCentresAndRecommendations() async {
    setState(() => _isLoading = true);
    final centres = await ApiService.getCentres();
    final rec = await ApiService.recommendSlots(widget.farmer.id, _selectedCrop);

    if (rec['highCongestionAlert'] != null) {
      final alert = rec['highCongestionAlert'];
      _congestedCentreWarning =
          '⚠️ ${alert['congestedCentreName']} has ${alert['congestedCentreQueue']} farmers waiting. We recommend ${alert['recommendedAlternativeName']} to save ~${alert['timeSavedMinutes']} mins!';
    } else {
      _congestedCentreWarning = null;
    }

    setState(() {
      _centres = centres;
      _selectedCentre = centres.isNotEmpty ? centres.first : null;
      _isLoading = false;
    });
  }

  Future<void> _handleBookSlot() async {
    if (_selectedCentre == null) return;

    final booking = await ApiService.bookSlot(
      farmerId: widget.farmer.id,
      centreId: _selectedCentre!.id,
      slotTime: _selectedSlot,
      crop: _selectedCrop,
      quantityQuintals: _quantity,
    );

    if (booking != null && mounted) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Slot Confirmed!'),
          content: Text(
            'Token Number: ${booking.tokenNumber}\n'
            'Mandi: ${_selectedCentre!.name}\n'
            'Slot Time: $_selectedSlot\n'
            'Queue Position: #${booking.queuePosition}\n\n'
            'An SMS confirmation has been dispatched to +91-${widget.farmer.mobile}.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Book Procurement Slot'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF065F46)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // High Congestion Warning Banner if applicable
                  if (_congestedCentreWarning != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFF59E0B)),
                      ),
                      child: Text(
                        _congestedCentreWarning!,
                        style: const TextStyle(
                          color: Color(0xFF92400E),
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Crop Selection
                  const Text('Select Crop', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: _selectedCrop,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    items: _crops.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedCrop = val);
                        _fetchCentresAndRecommendations();
                      }
                    },
                  ),

                  const SizedBox(height: 16),

                  // Quantity
                  const Text('Estimated Quantity (Quintals)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextFormField(
                    initialValue: '40',
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    onChanged: (val) => _quantity = double.tryParse(val) ?? 40.0,
                  ),

                  const SizedBox(height: 16),

                  // Centre Selection
                  const Text('Procurement Centre (Mandi Yard)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<ProcurementCentre>(
                    value: _selectedCentre,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    items: _centres.map((c) {
                      return DropdownMenuItem(
                        value: c,
                        child: Text(
                          '${c.name} (${c.district}) • Queue: ${c.currentQueueLength}',
                          style: const TextStyle(fontSize: 12),
                        ),
                      );
                    }).toList(),
                    onChanged: (val) => setState(() => _selectedCentre = val),
                  ),

                  const SizedBox(height: 20),

                  // Hourly Slots Grid
                  const Text('Available Hourly Time Slots (18 Sep 2026)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),

                  if (_selectedCentre != null)
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _selectedCentre!.slots.map((s) {
                        final slotText = s.slotRange;
                        final isSelected = _selectedSlot == slotText;
                        return ChoiceChip(
                          label: Text(slotText, style: const TextStyle(fontSize: 11)),
                          selected: isSelected,
                          selectedColor: const Color(0xFF065F46),
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.white : Colors.black87,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                          onSelected: (selected) {
                            if (selected) setState(() => _selectedSlot = slotText);
                          },
                        );
                      }).toList(),
                    ),

                  const SizedBox(height: 28),

                  // Confirm Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _handleBookSlot,
                      child: const Text(
                        'Confirm Booking & Generate Token',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
