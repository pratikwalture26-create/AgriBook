class Booking {
  final String id;
  final String bookingReference;
  final String tokenNumber;
  final String farmerId;
  final String farmerName;
  final String farmerMobile;
  final String centreId;
  final String centreName;
  final String crop;
  final double quantityQuintals;
  final String date;
  final String slotTime;
  final String status; // 'WAITING' | 'CALLED' | 'PROCESSING' | 'COMPLETED'
  final int queuePosition;
  final int estimatedWaitMinutes;
  final String bookingSource;

  Booking({
    required this.id,
    required this.bookingReference,
    required this.tokenNumber,
    required this.farmerId,
    required this.farmerName,
    required this.farmerMobile,
    required this.centreId,
    required this.centreName,
    required this.crop,
    required this.quantityQuintals,
    required this.date,
    required this.slotTime,
    required this.status,
    required this.queuePosition,
    required this.estimatedWaitMinutes,
    required this.bookingSource,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] ?? '',
      bookingReference: json['bookingReference'] ?? '',
      tokenNumber: json['tokenNumber'] ?? '',
      farmerId: json['farmerId'] ?? '',
      farmerName: json['farmerName'] ?? '',
      farmerMobile: json['farmerMobile'] ?? '',
      centreId: json['centreId'] ?? '',
      centreName: json['centreName'] ?? '',
      crop: json['crop'] ?? 'Cotton',
      quantityQuintals: (json['quantityQuintals'] as num?)?.toDouble() ?? 40.0,
      date: json['date'] ?? '',
      slotTime: json['slotTime'] ?? '',
      status: json['status'] ?? 'WAITING',
      queuePosition: json['queuePosition'] ?? 1,
      estimatedWaitMinutes: json['estimatedWaitMinutes'] ?? 15,
      bookingSource: json['bookingSource'] ?? 'APP',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'bookingReference': bookingReference,
    'tokenNumber': tokenNumber,
    'farmerId': farmerId,
    'farmerName': farmerName,
    'farmerMobile': farmerMobile,
    'centreId': centreId,
    'centreName': centreName,
    'crop': crop,
    'quantityQuintals': quantityQuintals,
    'date': date,
    'slotTime': slotTime,
    'status': status,
    'queuePosition': queuePosition,
    'estimatedWaitMinutes': estimatedWaitMinutes,
    'bookingSource': bookingSource,
  };
}
