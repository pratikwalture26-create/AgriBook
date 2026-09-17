import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/farmer.dart';
import '../models/centre.dart';
import '../models/booking.dart';
import '../models/procurement.dart';

class ApiService {
  // Configurable base URL: Use 10.0.2.2 for Android emulator, localhost for web/iOS
  static String baseUrl = 'http://localhost:3000/api';

  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  /// 1. Authentication: Send OTP via Twilio SMS backend
  static async sendOtp(String mobile) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/send-otp'),
        headers: _headers,
        body: jsonEncode({'mobile': mobile}),
      );
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      print('[AgriBook API Error] sendOtp: $e');
    }
    return {'success': true, 'demoOtp': '26032'};
  }

  /// 2. Authentication: Verify OTP & Return Farmer Profile
  static Future<Farmer?> verifyOtp(String mobile, String otp) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/verify-otp'),
        headers: _headers,
        body: jsonEncode({'mobile': mobile, 'otp': otp}),
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['farmer'] != null) {
          return Farmer.fromJson(data['farmer']);
        }
      }
    } catch (e) {
      print('[AgriBook API Error] verifyOtp: $e');
    }
    return null;
  }

  /// 3. Procurement Centres List
  static Future<List<ProcurementCentre>> getCentres() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/centres'), headers: _headers);
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final list = data['centres'] as List? ?? [];
        return list.map((c) => ProcurementCentre.fromJson(c)).toList();
      }
    } catch (e) {
      print('[AgriBook API Error] getCentres: $e');
    }
    return [];
  }

  /// 4. AI Slot Recommendation & Congestion Detection (XGBoost + Redis)
  static Future<Map<String, dynamic>> recommendSlots(String farmerId, String crop) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/slots/recommend'),
        headers: _headers,
        body: jsonEncode({'farmerId': farmerId, 'crop': crop}),
      );
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      print('[AgriBook API Error] recommendSlots: $e');
    }
    return {'recommendations': []};
  }

  /// 5. Book Slot & Enqueue in Redis
  static Future<Booking?> bookSlot({
    required String farmerId,
    required String centreId,
    required String slotTime,
    required String crop,
    required double quantityQuintals,
    String bookingSource = 'APP',
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/bookings'),
        headers: _headers,
        body: jsonEncode({
          'farmerId': farmerId,
          'centreId': centreId,
          'slotTime': slotTime,
          'crop': crop,
          'quantityQuintals': quantityQuintals,
          'bookingSource': bookingSource,
        }),
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['booking'] != null) {
          return Booking.fromJson(data['booking']);
        }
      }
    } catch (e) {
      print('[AgriBook API Error] bookSlot: $e');
    }
    return null;
  }

  /// 6. Live Redis Queue State
  static Future<Map<String, dynamic>> getLiveQueue(String centreId) async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/queue/$centreId'), headers: _headers);
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      print('[AgriBook API Error] getLiveQueue: $e');
    }
    return {'activeQueueDepth': 0, 'tokens': []};
  }

  /// 7. Operator: Call Next Farmer via Redis FIFO
  static Future<Map<String, dynamic>?> operatorCallNext(String centreId) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/queue/call-next'),
        headers: _headers,
        body: jsonEncode({'centreId': centreId}),
      );
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      print('[AgriBook API Error] operatorCallNext: $e');
    }
    return null;
  }

  /// 8. Finalize Procurement & Calculate MSP
  static Future<Map<String, dynamic>?> completeProcurement({
    required String tokenNumber,
    required double actualQuintals,
    String qualityGrade = 'Grade A (FAQ)',
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/procurement'),
        headers: _headers,
        body: jsonEncode({
          'tokenNumber': tokenNumber,
          'actualQuintals': actualQuintals,
          'qualityGrade': qualityGrade,
        }),
      );
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      print('[AgriBook API Error] completeProcurement: $e');
    }
    return null;
  }

  /// 9. Government Admin KPIs
  static Future<Map<String, dynamic>?> getAdminDashboard() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/admin/dashboard'), headers: _headers);
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      print('[AgriBook API Error] getAdminDashboard: $e');
    }
    return null;
  }
}
