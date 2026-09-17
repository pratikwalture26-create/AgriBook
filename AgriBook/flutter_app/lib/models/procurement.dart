class ProcurementRecord {
  final String id;
  final String bookingId;
  final String tokenNumber;
  final String farmerId;
  final String farmerName;
  final String centreId;
  final String crop;
  final double quantityQuintals;
  final String qualityGrade;
  final double mspRatePerQuintal;
  final double totalAmount;
  final String operatorId;
  final String weighmentSlipNumber;
  final String status;
  final DateTime createdAt;

  ProcurementRecord({
    required this.id,
    required this.bookingId,
    required this.tokenNumber,
    required this.farmerId,
    required this.farmerName,
    required this.centreId,
    required this.crop,
    required this.quantityQuintals,
    required this.qualityGrade,
    required this.mspRatePerQuintal,
    required this.totalAmount,
    required this.operatorId,
    required this.weighmentSlipNumber,
    required this.status,
    required this.createdAt,
  });

  factory ProcurementRecord.fromJson(Map<String, dynamic> json) {
    return ProcurementRecord(
      id: json['id'] ?? '',
      bookingId: json['bookingId'] ?? '',
      tokenNumber: json['tokenNumber'] ?? '',
      farmerId: json['farmerId'] ?? '',
      farmerName: json['farmerName'] ?? '',
      centreId: json['centreId'] ?? '',
      crop: json['crop'] ?? '',
      quantityQuintals: (json['quantityQuintals'] as num?)?.toDouble() ?? 0.0,
      qualityGrade: json['qualityGrade'] ?? 'Grade A (FAQ)',
      mspRatePerQuintal: (json['mspRatePerQuintal'] as num?)?.toDouble() ?? 7000.0,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      operatorId: json['operatorId'] ?? 'OP-01',
      weighmentSlipNumber: json['weighmentSlipNumber'] ?? '',
      status: json['status'] ?? 'COMPLETED',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}

class PaymentRecord {
  final String id;
  final String procurementId;
  final String bookingId;
  final String farmerId;
  final String farmerName;
  final String farmerMobile;
  final double amount;
  final String status; // 'PROCESSING' | 'PAID' | 'PENDING'
  final String referenceNumber;
  final String paymentMethod;
  final DateTime initiatedAt;

  PaymentRecord({
    required this.id,
    required this.procurementId,
    required this.bookingId,
    required this.farmerId,
    required this.farmerName,
    required this.farmerMobile,
    required this.amount,
    required this.status,
    required this.referenceNumber,
    required this.paymentMethod,
    required this.initiatedAt,
  });

  factory PaymentRecord.fromJson(Map<String, dynamic> json) {
    return PaymentRecord(
      id: json['id'] ?? '',
      procurementId: json['procurementId'] ?? '',
      bookingId: json['bookingId'] ?? '',
      farmerId: json['farmerId'] ?? '',
      farmerName: json['farmerName'] ?? '',
      farmerMobile: json['farmerMobile'] ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'PROCESSING',
      referenceNumber: json['referenceNumber'] ?? '',
      paymentMethod: json['paymentMethod'] ?? 'Direct Bank Transfer',
      initiatedAt: json['initiatedAt'] != null
          ? DateTime.tryParse(json['initiatedAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
