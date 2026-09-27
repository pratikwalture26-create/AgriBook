/**
 * AgriBook Backend In-Memory Store & MongoDB/Redis Synchronization Layer
 * Smart India Hackathon 2026 (SIH26032)
 */

import {
  INITIAL_FARMERS,
  INITIAL_CENTRES,
  INITIAL_BOOKINGS,
  INITIAL_PROCUREMENTS,
  INITIAL_PAYMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  MSP_RATES,
} from '../../../src/data/sampleData';
import {
  IFarmerDocument,
  IProcurementCentreDocument,
  IBookingDocument,
  IProcurementDocument,
  IPaymentDocument,
  IAuditLogDocument,
  IFeedbackDocument,
} from '../models/Schemas';
import { redisQueue } from './redisQueueService';
import { notificationService } from './notificationService';

class BackendDataStore {
  public farmers: IFarmerDocument[] = [];
  public centres: any[] = [];
  public bookings: IBookingDocument[] = [];
  public procurements: IProcurementDocument[] = [];
  public payments: IPaymentDocument[] = [];
  public auditLogs: IAuditLogDocument[] = [];
  public feedback: IFeedbackDocument[] = [];

  constructor() {
    this.seed();
  }

  public seed() {
    this.farmers = JSON.parse(JSON.stringify(INITIAL_FARMERS));
    this.centres = JSON.parse(JSON.stringify(INITIAL_CENTRES));
    this.bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
    this.procurements = JSON.parse(JSON.stringify(INITIAL_PROCUREMENTS));
    this.payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.feedback = [];

    // Initialize Redis queues for all centres with accurate statuses
    for (const centre of this.centres) {
      redisQueue.setProcessingRate(centre.id, centre.processingRatePerHour || 8);
      const centreBookings = this.bookings.filter((b) => b.centreId === centre.id);
      
      for (const b of centreBookings) {
        redisQueue.enqueue(centre.id, b.tokenNumber, {
          tokenNumber: b.tokenNumber,
          bookingId: b.id,
          farmerId: b.farmerId,
          farmerName: b.farmerName,
          farmerMobile: b.farmerMobile,
          crop: b.crop,
          quantityQuintals: b.quantityQuintals,
          status: b.status as any,
          enqueuedAt: Date.now() - 3600000,
          calledAt: b.calledAt ? new Date(b.calledAt).getTime() : undefined,
          processingStartedAt: b.processingStartedAt ? new Date(b.processingStartedAt).getTime() : undefined,
          completedAt: b.completedAt ? new Date(b.completedAt).getTime() : undefined,
          slotTime: b.slotTime,
          moisturePercentage: b.status === 'PROCESSING' ? 8.2 : undefined,
        });
      }
      redisQueue.recalculateWaitingPositions(centre.id);
    }
  }

  public resetPresentationDemo(centreId = 'centre-1') {
    this.seed();
    return redisQueue.getQueueSnapshot(centreId);
  }

  public logAudit(actor: string, role: string, action: string, entityType: string, entityId: string, details: string, status: 'SUCCESS' | 'WARN' | 'INFO' = 'SUCCESS') {
    const log: IAuditLogDocument = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(),
      actor,
      role,
      action,
      entityType,
      entityId,
      details,
      status,
    };
    this.auditLogs.unshift(log);
    return log;
  }
}

export const backendStore = new BackendDataStore();
