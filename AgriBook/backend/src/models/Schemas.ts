/**
 * AgriBook MongoDB Schemas & Document Types
 * Smart India Hackathon 2026 (SIH26032)
 *
 * Designed for Mongoose / MongoDB ODM for durable storage of farmers,
 * centres, bookings, procurements, payments, and audit logs.
 */

export interface IFarmerDocument {
  _id?: string;
  id: string;
  name: string;
  mobile: string;
  village: string;
  district: string;
  state: string;
  crops: string[];
  primaryCrop: string;
  expectedQuantityQuintals: number;
  landDetails: {
    totalAcres: number;
    surveyNumber: string;
    village: string;
    taluka: string;
    district: string;
    state: string;
  };
  aadhaarLastFour: string;
  bankAccountLastFour: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProcurementCentreDocument {
  _id?: string;
  id: string;
  name: string;
  code: string;
  address: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  supportedCrops: string[];
  dailyCapacity: number;
  processingRatePerHour: number;
  operatingStatus: 'OPEN' | 'BUSY' | 'CLOSING_SOON' | 'CLOSED';
  createdAt: Date;
}

export interface IBookingDocument {
  _id?: string;
  id: string;
  bookingReference: string;
  tokenNumber: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  centreId: string;
  centreName: string;
  crop: string;
  quantityQuintals: number;
  date: string;
  slotTime: string;
  status: 'CONFIRMED' | 'WAITING' | 'CALLED' | 'PROCESSING' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  queuePosition: number;
  estimatedWaitMinutes: number;
  bookingSource: 'APP' | 'HELPLINE_OPERATOR' | 'SMS';
  calledAt?: Date;
  processingStartedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface IProcurementDocument {
  _id?: string;
  id: string;
  bookingId: string;
  tokenNumber: string;
  farmerId: string;
  farmerName: string;
  centreId: string;
  crop: string;
  quantityQuintals: number;
  qualityGrade: string;
  mspRatePerQuintal: number;
  totalAmount: number;
  operatorId: string;
  weighmentSlipNumber: string;
  status: 'COMPLETED';
  createdAt: Date;
}

export interface IPaymentDocument {
  _id?: string;
  id: string;
  procurementId: string;
  bookingId: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  amount: number;
  status: 'PENDING' | 'INITIATED' | 'PROCESSING' | 'PAID' | 'FAILED';
  referenceNumber: string;
  paymentMethod: string;
  initiatedAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

export interface IAuditLogDocument {
  _id?: string;
  id: string;
  timestamp: Date;
  actor: string;
  role: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  status: 'SUCCESS' | 'WARN' | 'INFO';
}

export interface IFeedbackDocument {
  _id?: string;
  id: string;
  farmerId: string;
  centreId: string;
  tokenNumber: string;
  rating: number;
  waitingExperienceRating: number;
  staffBehaviorRating: number;
  comment: string;
  createdAt: Date;
}
