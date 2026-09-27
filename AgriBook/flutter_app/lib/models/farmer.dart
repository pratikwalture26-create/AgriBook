class LandDetails {
  final double totalAcres;
  final String surveyNumber;
  final String village;
  final String taluka;
  final String district;
  final String state;

  LandDetails({
    required this.totalAcres,
    required this.surveyNumber,
    required this.village,
    required this.taluka,
    required this.district,
    required this.state,
  });

  factory LandDetails.fromJson(Map<String, dynamic> json) {
    return LandDetails(
      totalAcres: (json['totalAcres'] as num?)?.toDouble() ?? 0.0,
      surveyNumber: json['surveyNumber'] ?? '',
      village: json['village'] ?? '',
      taluka: json['taluka'] ?? '',
      district: json['district'] ?? '',
      state: json['state'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'totalAcres': totalAcres,
    'surveyNumber': surveyNumber,
    'village': village,
    'taluka': taluka,
    'district': district,
    'state': state,
  };
}

class Farmer {
  final String id;
  final String name;
  final String mobile;
  final String village;
  final String district;
  final String state;
  final String primaryCrop;
  final double expectedQuantityQuintals;
  final LandDetails landDetails;
  final String aadhaarLastFour;
  final String bankAccountLastFour;

  Farmer({
    required this.id,
    required this.name,
    required this.mobile,
    required this.village,
    required this.district,
    required this.state,
    required this.primaryCrop,
    required this.expectedQuantityQuintals,
    required this.landDetails,
    required this.aadhaarLastFour,
    required this.bankAccountLastFour,
  });

  factory Farmer.fromJson(Map<String, dynamic> json) {
    return Farmer(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      mobile: json['mobile'] ?? '',
      village: json['village'] ?? '',
      district: json['district'] ?? '',
      state: json['state'] ?? '',
      primaryCrop: json['primaryCrop'] ?? 'Cotton',
      expectedQuantityQuintals: (json['expectedQuantityQuintals'] as num?)?.toDouble() ?? 40.0,
      landDetails: LandDetails.fromJson(json['landDetails'] ?? {}),
      aadhaarLastFour: json['aadhaarLastFour'] ?? '',
      bankAccountLastFour: json['bankAccountLastFour'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'mobile': mobile,
    'village': village,
    'district': district,
    'state': state,
    'primaryCrop': primaryCrop,
    'expectedQuantityQuintals': expectedQuantityQuintals,
    'landDetails': landDetails.toJson(),
    'aadhaarLastFour': aadhaarLastFour,
    'bankAccountLastFour': bankAccountLastFour,
  };
}
