/**
 * AgriBook Payment Simulation Service
 * Smart India Hackathon 2026 (SIH26032)
 *
 * Simulates the procurement payment lifecycle:
 * PROCUREMENT COMPLETED -> PAYMENT INITIATED -> PROCESSING -> PAID
 *
 * Designed to connect to Razorpay or authorized state PFMS in future integration.
 */

export interface PaymentTriggerRequest {
  procurementId: string;
  farmerId: string;
  amount: number;
  bankAccountLastFour: string;
}

export class PaymentService {
  public async triggerPayment(req: PaymentTriggerRequest) {
    const referenceNumber = `PX-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    return {
      success: true,
      referenceNumber,
      status: 'PROCESSING',
      amount: req.amount,
      note: 'Prototype PFMS / Razorpay status simulation layer for SIH 26032.',
    };
  }

  public async markPaid(referenceNumber: string) {
    return {
      success: true,
      referenceNumber,
      status: 'PAID',
      settledAt: new Date().toISOString(),
    };
  }
}

export const paymentService = new PaymentService();
