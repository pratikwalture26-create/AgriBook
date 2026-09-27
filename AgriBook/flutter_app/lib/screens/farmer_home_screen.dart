import 'package:flutter/material.dart';
import '../models/farmer.dart';
import '../models/booking.dart';
import '../services/api_service.dart';
import 'book_slot_screen.dart';

class FarmerHomeScreen extends StatefulWidget {
  const FarmerHomeScreen({Key? key}) : super(key: key);

  @override
  State<FarmerHomeScreen> createState() => _FarmerHomeScreenState();
}

class _FarmerHomeScreenState extends State<FarmerHomeScreen> {
  Farmer? _farmer;
  Booking? _activeBooking;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() => _isLoading = true);
    // In production, farmer is stored from OTP login. For prototype: load demo farmer Ramesh Patil
    final farmer = await ApiService.verifyOtp('9822104512', '26032');
    setState(() {
      _farmer = farmer ??
          Farmer(
            id: 'farmer-1',
            name: 'Ramesh Patil',
            mobile: '9822104512',
            village: 'Sawangi Meghe',
            district: 'Wardha',
            state: 'Maharashtra',
            primaryCrop: 'Cotton',
            expectedQuantityQuintals: 45.0,
            landDetails: LandDetails(
              totalAcres: 6.5,
              surveyNumber: '142/2A',
              village: 'Sawangi Meghe',
              taluka: 'Wardha',
              district: 'Wardha',
              state: 'Maharashtra',
            ),
            aadhaarLastFour: '7821',
            bankAccountLastFour: '4509',
          );
      _activeBooking = Booking(
        id: 'booking-1',
        bookingReference: 'AGB-2026-00412',
        tokenNumber: 'A105',
        farmerId: 'farmer-1',
        farmerName: 'Ramesh Patil',
        farmerMobile: '9822104512',
        centreId: 'centre-1',
        centreName: 'Wardha Central APMC Sub-Yard',
        crop: 'Cotton',
        quantityQuintals: 45.0,
        date: '2026-09-18',
        slotTime: '10:00 AM – 11:00 AM',
        status: 'WAITING',
        queuePosition: 4,
        estimatedWaitMinutes: 28,
        bookingSource: 'APP',
      );
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

    final farmer = _farmer!;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'AgriBook • किसान सुविधा',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            Text(
              '${farmer.village}, ${farmer.district}',
              style: const TextStyle(fontSize: 11, color: Color(0xFFA7F3D0)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadInitialData,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Farmer Verified ID Banner
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: const Color(0xFFECFDF5),
                      radius: 24,
                      child: Text(
                        farmer.name.substring(0, 1),
                        style: const TextStyle(
                          color: Color(0xFF065F46),
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                farmer.name,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Icon(Icons.verified, size: 16, color: Color(0xFF059669)),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Crop: ${farmer.primaryCrop} • Land: ${farmer.landDetails.totalAcres} Acres',
                            style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                          ),
                          Text(
                            'Aadhaar: ****${farmer.aadhaarLastFour} • Bank: ****${farmer.bankAccountLastFour}',
                            style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Active Queue Token Card
            if (_activeBooking != null) ...[
              Card(
                color: const Color(0xFF064E3B),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF047857),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.circle, size: 8, color: Color(0xFF34D399)),
                                SizedBox(width: 6),
                                Text(
                                  'LIVE QUEUE TOKEN',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            _activeBooking!.status,
                            style: const TextStyle(
                              color: Color(0xFFFDE68A),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Token Number',
                                style: TextStyle(color: Color(0xFFA7F3D0), fontSize: 11),
                              ),
                              Text(
                                _activeBooking!.tokenNumber,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 32,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 1.2,
                                ),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              const Text(
                                'Queue Position',
                                style: TextStyle(color: Color(0xFFA7F3D0), fontSize: 11),
                              ),
                              Text(
                                '#${_activeBooking!.queuePosition}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const Divider(color: Color(0xFF047857), height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Est. Wait: ~${_activeBooking!.estimatedWaitMinutes} mins',
                            style: const TextStyle(
                              color: Color(0xFFFDE68A),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            _activeBooking!.centreName,
                            style: const TextStyle(color: Color(0xFFA7F3D0), fontSize: 11),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Action Button: Book Slot
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.calendar_today),
                label: const Text(
                  'Book Procurement Slot (AI Smart Allocator)',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => BookSlotScreen(farmer: farmer),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 20),

            // Past Procurements & Payment Status Card
            const Text(
              'Past Procurements & Payment Tracker',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '40 Qtl Cotton (Grade A FAQ)',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Weighment Slip #WS-2026-8812',
                              style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDCFCE7),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'PAID',
                            style: TextStyle(
                              color: Color(0xFF166534),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 18),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Text('MSP Rate: ₹7,521 / Qtl', style: TextStyle(fontSize: 12)),
                        Text(
                          '₹3,00,840',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF065F46),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
