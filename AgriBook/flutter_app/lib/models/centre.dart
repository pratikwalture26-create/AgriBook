class TimeSlot {
  final String id;
  final String centreId;
  final String date;
  final String startTime;
  final String endTime;
  final int capacity;
  final int bookedCount;
  final bool isPeak;

  TimeSlot({
    required this.id,
    required this.centreId,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.capacity,
    required this.bookedCount,
    required this.isPeak,
  });

  factory TimeSlot.fromJson(Map<String, dynamic> json) {
    return TimeSlot(
      id: json['id'] ?? '',
      centreId: json['centreId'] ?? '',
      date: json['date'] ?? '',
      startTime: json['startTime'] ?? '',
      endTime: json['endTime'] ?? '',
      capacity: json['capacity'] ?? 10,
      bookedCount: json['bookedCount'] ?? 0,
      isPeak: json['isPeak'] ?? false,
    );
  }

  String get slotRange => '$startTime – $endTime';
  bool get isFull => bookedCount >= capacity;
}

class ProcurementCentre {
  final String id;
  final String name;
  final String code;
  final String address;
  final String district;
  final String state;
  final double latitude;
  final double longitude;
  final List<String> supportedCrops;
  final int dailyCapacity;
  final int processingRatePerHour;
  final String operatingStatus;
  final int currentQueueLength;
  final int completedTodayCount;
  final String congestionLevel; // 'NORMAL' | 'MODERATE' | 'HIGH'
  final double distanceKm;
  final List<TimeSlot> slots;

  ProcurementCentre({
    required this.id,
    required this.name,
    required this.code,
    required this.address,
    required this.district,
    required this.state,
    required this.latitude,
    required this.longitude,
    required this.supportedCrops,
    required this.dailyCapacity,
    required this.processingRatePerHour,
    required this.operatingStatus,
    required this.currentQueueLength,
    required this.completedTodayCount,
    required this.congestionLevel,
    required this.distanceKm,
    required this.slots,
  });

  factory ProcurementCentre.fromJson(Map<String, dynamic> json) {
    final rawSlots = json['slots'] as List? ?? [];
    final rawCrops = json['supportedCrops'] as List? ?? [];

    return ProcurementCentre(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      address: json['address'] ?? '',
      district: json['district'] ?? '',
      state: json['state'] ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      supportedCrops: rawCrops.map((c) => c.toString()).toList(),
      dailyCapacity: json['dailyCapacity'] ?? 100,
      processingRatePerHour: json['processingRatePerHour'] ?? 8,
      operatingStatus: json['operatingStatus'] ?? 'OPEN',
      currentQueueLength: json['currentQueueLength'] ?? 0,
      completedTodayCount: json['completedTodayCount'] ?? 0,
      congestionLevel: json['congestionLevel'] ?? 'NORMAL',
      distanceKm: (json['distanceKm'] as num?)?.toDouble() ?? 15.0,
      slots: rawSlots.map((s) => TimeSlot.fromJson(s)).toList(),
    );
  }
}
