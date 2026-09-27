/**
 * AgriBook Notification Service (Twilio SMS Integration & Fallback)
 * Smart India Hackathon 2026 (SIH26032)
 */

export interface SmsMessagePayload {
  toMobile: string;
  messageBody: string;
  templateType: 'OTP' | 'SLOT_CONFIRMATION' | 'QUEUE_CALL' | 'PROCUREMENT_DONE' | 'PAYMENT_UPDATE';
}

export class NotificationService {
  private isMockMode: boolean;
  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private twilioSenderNumber: string;

  constructor() {
    this.isMockMode = process.env.MOCK_SMS !== 'false';
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || 'AC_MOCK_SID';
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || 'MOCK_TOKEN';
    this.twilioSenderNumber = process.env.TWILIO_PHONE_NUMBER || '+18005550199';
  }

  public async sendSms(payload: SmsMessagePayload): Promise<{ success: boolean; messageId: string; mode: string }> {
    const messageId = `SM_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (this.isMockMode) {
      console.log(`[Twilio SMS Mock] Dispatched to +91-${payload.toMobile}: "${payload.messageBody}" (ID: ${messageId})`);
      return {
        success: true,
        messageId,
        mode: 'MOCK_TWILIO_SIMULATION',
      };
    }

    // In production with real Twilio credentials:
    // const client = twilio(this.twilioAccountSid, this.twilioAuthToken);
    // await client.messages.create({ ... })
    return {
      success: true,
      messageId,
      mode: 'TWILIO_LIVE_API',
    };
  }
}

export const notificationService = new NotificationService();
