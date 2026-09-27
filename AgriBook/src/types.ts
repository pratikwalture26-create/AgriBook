/**
 * AgriBook - Smart Slot & Queue Management for Agricultural Procurement
 * Smart India Hackathon 2026 (SIH26032)
 * Ministry of Consumer Affairs, Food & Public Distribution
 */

export type UserRole = 'FARMER' | 'OPERATOR' | 'ADMIN' | 'HELPLINE';

export type Language = 'en' | 'hi';

export type CropType = 'Cotton' | 'Soyabean' | 'Wheat' | 'Paddy' | 'Tur (Arhar)' | 'Gram (Chana)';

export type CongestionLevel = 'NORMAL' | 'MODERATE' | 'HIGH';

export type BookingStatus = 'CONFIRMED' | 'WAITING' | 'CALLED' | 'PROCESSING' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'INITIATED' | 'PROCESSING' | 'PAID' | 'FAILED';

export interface LandDetails {
  totalAcres: number;
  surveyNumber: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
}

export interface Farmer {
  id: string;
  name: string;
  mobile: string;
  village: string;
  district: string;
  state: string;
  primaryCrop: CropType;
  expectedQuantityQuintals: number;
  landDetails: LandDetails;
  aadhaarLastFour: string;
  bankAccountLastFour: string;
  registeredAt: string;
}

export interface TimeSlot {
  id: string;
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "10:00 AM"
  capacity: number;
  bookedCount: number;
  isRecommended?: boolean;
}

export interface ProcurementCentre {
  id: string;
  name: string;
  code: string;
  address: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  supportedCrops: CropType[];
  dailyCapacity: number; // farmers per day
  processingRatePerHour: number; // farmers per hour
  currentQueueLength: number;
  currentlyProcessing: number;
  completedTodayCount: number;
  operatingStatus: 'OPEN' | 'BUSY' | 'CLOSING_SOON' | 'CLOSED';
  slots: TimeSlot[];
  // AI & Analytics attributes
  predictedDemandToday: number;
  congestionScore: number; // 0 to 100
  congestionLevel: CongestionLevel;
  distanceKm?: number; // relative to selected farmer
}

export interface Booking {
  id: string;
  bookingReference: string; // e.g. "AGR-2026-0918-A105"
  tokenNumber: string;      // e.g. "A105"
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  centreId: string;
  centreName: string;
  centreAddress: string;
  crop: CropType;
  quantityQuintals: number;
  date: string;             // YYYY-MM-DD
  slotTime: string;         // e.g. "10:00 AM – 11:00 AM"
  status: BookingStatus;
  queuePosition: number;
  estimatedWaitMinutes: number;
  bookingSource: 'APP' | 'HELPLINE_OPERATOR' | 'SMS';
  createdAt: string;
  calledAt?: string;
  processingStartedAt?: string;
  completedAt?: string;
}

export interface ProcurementRecord {
  id: string;
  bookingId: string;
  tokenNumber: string;
  farmerId: string;
  farmerName: string;
  centreId: string;
  centreName: string;
  crop: CropType;
  quantityQuintals: number;
  qualityGrade: 'Grade A (FAQ)' | 'Grade B' | 'Standard';
  mspRatePerQuintal: number;
  totalAmount: number;
  operatorId: string;
  operatorName: string;
  status: 'COMPLETED';
  completedAt: string;
  weighmentSlipNumber: string;
}

export interface PaymentRecord {
  id: string;
  procurementId: string;
  bookingId: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  amount: number;
  status: PaymentStatus;
  referenceNumber: string; // e.g. "PX-2026-00125"
  paymentMethod: 'Prototype PFMS Simulation' | 'Razorpay Demo Gateway';
  initiatedAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface NotificationItem {
  id: string;
  farmerId: string;
  farmerMobile: string;
  title: string;
  message: string;
  type: 'SLOT_CONFIRMED' | 'QUEUE_UPDATE' | 'CALLED_ALERT' | 'CONGESTION_ALERT' | 'PROCUREMENT_DONE' | 'PAYMENT_UPDATE' | 'REMINDER';
  channel: 'SMS' | 'IN_APP' | 'BOTH';
  timestamp: string;
  isRead: boolean;
  smsSenderId: string; // e.g. "AD-AGRIBOOK"
}

export interface FeedbackItem {
  id: string;
  farmerId: string;
  farmerName: string;
  centreId: string;
  centreName: string;
  tokenNumber: string;
  rating: number; // 1 to 5
  waitingExperienceRating: number; // 1 to 5
  staffBehaviorRating: number; // 1 to 5
  comment: string;
  submittedAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entityType: 'BOOKING' | 'QUEUE' | 'PROCUREMENT' | 'PAYMENT' | 'FARMER' | 'NOTIFICATION';
  entityId: string;
  details: string;
  status: 'SUCCESS' | 'WARN' | 'INFO';
}

export interface DemandForecastInput {
  centreId: string;
  crop: CropType;
  dayOfWeek: number; // 0-6
  hourOfDay: number;
  historicalArrivalsAvg: number;
  currentBookings: number;
  centreCapacity: number;
  processingRate: number;
  seasonalIndex: number;
}

export interface DemandForecastOutput {
  centreId: string;
  centreName: string;
  predictedDemand: number;
  confidenceScore: number;
  congestionProbability: number;
  predictedCongestionLevel: CongestionLevel;
  topDrivers: { feature: string; impact: string }[];
}

export interface SlotRecommendationRequest {
  farmerId: string;
  crop: CropType;
  quantityQuintals: number;
  preferredDate: string;
}

export interface ScoringBreakdown {
  waitMinutes: number;
  waitScore: number; // 0-100 (higher is better)
  availableSlots: number;
  totalCapacity: number;
  capacityScore: number; // 0-100
  predictedArrivals: number;
  congestionProbability: number;
  congestionScore: number; // 0-100
  distanceKm: number;
  distanceScore: number; // 0-100
  compositeSuitability: number; // 0-100
}

export interface RecommendationRationale {
  lowerWaitTime: string;
  availableCapacity: string;
  lowerCongestion: string;
  reasonableDistance: string;
  summary: string;
}

export interface RecommendedCentreSlot {
  centre: ProcurementCentre;
  recommendedSlot: TimeSlot;
  suitabilityScore: number; // For backward compatibility (lower was better)
  suitabilityIndex: number; // 0 to 100 transparent score (higher is better)
  isRecommended: boolean;
  rank: number; // 1, 2, 3
  reason: string;
  rationale: RecommendationRationale;
  breakdown: ScoringBreakdown;
  isAlternativeRecommendation?: boolean;
  alternativeToCentreName?: string;
  alternativeReason?: string;
}
