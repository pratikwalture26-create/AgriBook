/**
 * AgriBook State Management & Real-time Synchronization Engine
 * Implements the operational layer combining:
 * - Persistent Database (MongoDB schema simulation)
 * - Live Queue Layer (Redis key-value & lists semantics)
 * - Twilio SMS dispatch simulation
 * - Razorpay / PFMS payment status lifecycle
 * - Automated Audit Log trail
 */

import { useState, useEffect } from 'react';
import {
  Farmer,
  ProcurementCentre,
  Booking,
  ProcurementRecord,
  PaymentRecord,
  NotificationItem,
  AuditLogItem,
  FeedbackItem,
  UserRole,
  Language,
  CropType,
} from '../types';
import {
  INITIAL_FARMERS,
  INITIAL_CENTRES,
  INITIAL_BOOKINGS,
  INITIAL_PROCUREMENTS,
  INITIAL_PAYMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FEEDBACK,
  MSP_RATES,
} from '../data/sampleData';

const STORAGE_KEY = 'agribook_sih2026_state_v1';

export interface AppState {
  currentRole: UserRole;
  language: Language;
  currentFarmerId: string;
  selectedCentreId: string;
  farmers: Farmer[];
  centres: ProcurementCentre[];
  bookings: Booking[];
  procurements: ProcurementRecord[];
  payments: PaymentRecord[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  feedback: FeedbackItem[];
  // Active demo toast/banner
  activeToast: { title: string; message: string; type: string } | null;
}

function loadInitialState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not load localStorage, using defaults', e);
  }

  return {
    currentRole: 'FARMER',
    language: 'en',
    currentFarmerId: 'farmer-1', // Ramesh Patil
    selectedCentreId: 'centre-1', // Wardha Central APMC
    farmers: INITIAL_FARMERS,
    centres: INITIAL_CENTRES,
    bookings: INITIAL_BOOKINGS,
    procurements: INITIAL_PROCUREMENTS,
    payments: INITIAL_PAYMENTS,
    notifications: INITIAL_NOTIFICATIONS,
    auditLogs: INITIAL_AUDIT_LOGS,
    feedback: INITIAL_FEEDBACK,
    activeToast: null,
  };
}

let globalState: AppState = loadInitialState();
const listeners = new Set<(state: AppState) => void>();

function persistAndNotify(updater: (prev: AppState) => AppState) {
  globalState = updater(globalState);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  } catch (e) {
    console.error('Storage error', e);
  }
  listeners.forEach((listener) => listener(globalState));
}

export function useAgriBook() {
  const [state, setState] = useState<AppState>(globalState);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState<boolean>(true);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  // Connect to Node.js Real-time SSE Stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/queue/stream?centreId=${state.selectedCentreId}`);
      eventSource.onopen = () => {
        setIsRealTimeConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.snapshot) {
            handleRealTimeQueueSync(payload.snapshot);
          }
        } catch {
          // ignore heartbeat / invalid format
        }
      };

      eventSource.onerror = () => {
        setIsRealTimeConnected(false);
      };
    } catch {
      setIsRealTimeConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [state.selectedCentreId]);

  /**
   * Synchronize incoming snapshot from Node.js backend real-time layer
   */
  const handleRealTimeQueueSync = (snapshot: any) => {
    if (!snapshot) return;

    persistAndNotify((prev) => {
      const allSnapshotTokens = [
        ...(snapshot.currentQueue || []),
        ...(snapshot.calledTokens || []),
        ...(snapshot.processingList || (snapshot.currentlyProcessing ? [snapshot.currentlyProcessing] : [])),
        ...(snapshot.completedTokens || []),
      ];

      const updatedBookings = prev.bookings.map((b) => {
        const matching = allSnapshotTokens.find((t: any) => t.tokenNumber === b.tokenNumber);
        if (matching) {
          return {
            ...b,
            status: matching.status,
            queuePosition: matching.queuePosition || 0,
            estimatedWaitMinutes: matching.estimatedWaitMinutes !== undefined ? matching.estimatedWaitMinutes : b.estimatedWaitMinutes,
            calledAt: matching.calledAt ? new Date(matching.calledAt).toISOString() : b.calledAt,
            processingStartedAt: matching.processingStartedAt ? new Date(matching.processingStartedAt).toISOString() : b.processingStartedAt,
            completedAt: matching.completedAt ? new Date(matching.completedAt).toISOString() : b.completedAt,
          };
        }
        return b;
      });

      const updatedCentres = prev.centres.map((c) => {
        if (c.id === snapshot.centreId) {
          return {
            ...c,
            currentQueueLength: snapshot.summary?.waitingCount ?? c.currentQueueLength,
            currentlyProcessing: snapshot.summary?.processingCount ?? c.currentlyProcessing,
            completedTodayCount: snapshot.summary?.completedCount ?? c.completedTodayCount,
          };
        }
        return c;
      });

      return {
        ...prev,
        bookings: updatedBookings,
        centres: updatedCentres,
      };
    });
  };

  const setRole = (role: UserRole) => {
    persistAndNotify((prev) => ({ ...prev, currentRole: role }));
  };

  const setLanguage = (lang: Language) => {
    persistAndNotify((prev) => ({ ...prev, language: lang }));
  };

  const setSelectedCentre = (centreId: string) => {
    persistAndNotify((prev) => ({ ...prev, selectedCentreId: centreId }));
  };

  const setCurrentFarmer = (farmerId: string) => {
    persistAndNotify((prev) => ({ ...prev, currentFarmerId: farmerId }));
  };

  const clearToast = () => {
    persistAndNotify((prev) => ({ ...prev, activeToast: null }));
  };

  /**
   * Helper: Add Audit Log Entry
   */
  const logAudit = (
    actor: string,
    role: string,
    action: string,
    entityType: AuditLogItem['entityType'],
    entityId: string,
    details: string,
    status: AuditLogItem['status'] = 'INFO'
  ) => {
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actor,
      role,
      action,
      entityType,
      entityId,
      details,
      status,
    };
    return newLog;
  };

  /**
   * Helper: Send Twilio SMS & In-app Notification
   */
  const dispatchNotification = (
    farmerId: string,
    farmerMobile: string,
    title: string,
    message: string,
    type: NotificationItem['type']
  ): NotificationItem => {
    return {
      id: `notif-${Date.now()}`,
      farmerId,
      farmerMobile,
      title,
      message,
      type,
      channel: 'BOTH',
      timestamp: new Date().toISOString(),
      isRead: false,
      smsSenderId: 'AD-AGRIBOOK',
    };
  };

  /**
   * Book a slot for a farmer
   */
  const bookSlot = (
    farmerId: string,
    centreId: string,
    slotTime: string,
    crop: CropType,
    quantityQuintals: number,
    date: string = '2026-09-18',
    bookingSource: 'APP' | 'HELPLINE_OPERATOR' = 'APP'
  ) => {
    const farmer = globalState.farmers.find((f) => f.id === farmerId);
    const centre = globalState.centres.find((c) => c.id === centreId);
    if (!farmer || !centre) return null;

    // Generate token number (e.g. A106, B102)
    const tokenPrefix = centre.code.split('-')[0].charAt(0);
    const randomNum = Math.floor(100 + Math.random() * 900);
    const tokenNumber = `${tokenPrefix}${randomNum}`;
    const bookingRef = `AGR-2026-${tokenNumber}`;

    // Redis queue calculation: new position is currentQueueLength + 1
    const newQueuePosition = centre.currentQueueLength + 1;
    const estWaitMinutes = Math.round((newQueuePosition / (centre.processingRatePerHour || 8)) * 60);

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      bookingReference: bookingRef,
      tokenNumber,
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerMobile: farmer.mobile,
      centreId: centre.id,
      centreName: centre.name,
      centreAddress: centre.address,
      crop,
      quantityQuintals,
      date,
      slotTime,
      status: 'WAITING',
      queuePosition: newQueuePosition,
      estimatedWaitMinutes: estWaitMinutes,
      bookingSource,
      createdAt: new Date().toISOString(),
    };

    const notif = dispatchNotification(
      farmer.id,
      farmer.mobile,
      'Slot Booking Confirmed',
      `Your slot for ${crop} (${quantityQuintals} Qtl) at ${centre.name} is confirmed for ${date}, ${slotTime}. Token: ${tokenNumber}. Est. wait: ${estWaitMinutes} min.`,
      'SLOT_CONFIRMED'
    );

    const audit = logAudit(
      bookingSource === 'APP' ? `farmer_${farmer.name.toLowerCase().replace(/\s+/g, '_')}` : 'helpline_agent',
      bookingSource === 'APP' ? 'FARMER' : 'HELPLINE',
      'SLOT_BOOKED',
      'BOOKING',
      newBooking.id,
      `Allocated Token ${tokenNumber} at ${centre.name} for ${slotTime}`,
      'SUCCESS'
    );

    persistAndNotify((prev) => {
      // Increment booked count in centre slot
      const updatedCentres = prev.centres.map((c) => {
        if (c.id === centre.id) {
          const updatedSlots = c.slots.map((s) => {
            if (s.startTime && slotTime.includes(s.startTime)) {
              return { ...s, bookedCount: Math.min(s.capacity, s.bookedCount + 1) };
            }
            return s;
          });
          return {
            ...c,
            currentQueueLength: c.currentQueueLength + 1,
            slots: updatedSlots,
          };
        }
        return c;
      });

      return {
        ...prev,
        centres: updatedCentres,
        bookings: [newBooking, ...prev.bookings],
        notifications: [notif, ...prev.notifications],
        auditLogs: [audit, ...prev.auditLogs],
        activeToast: {
          title: 'Booking Confirmed & SMS Sent!',
          message: `Token ${tokenNumber} issued. SMS sent to +91-${farmer.mobile}.`,
          type: 'success',
        },
      };
    });

    return newBooking;
  };

  /**
   * Operator Action: Call Next Farmer in Live Queue
   */
  const callNextFarmer = (centreId: string) => {
    const centre = globalState.centres.find((c) => c.id === centreId);
    if (!centre) return;

    // Find the earliest waiting booking for this centre
    const waitingBooking = globalState.bookings.find(
      (b) => b.centreId === centreId && b.status === 'WAITING'
    );

    if (!waitingBooking) {
      persistAndNotify((prev) => ({
        ...prev,
        activeToast: {
          title: 'Queue is Empty',
          message: 'No farmers currently waiting in queue for this centre.',
          type: 'info',
        },
      }));
      return;
    }

    const notif = dispatchNotification(
      waitingBooking.farmerId,
      waitingBooking.farmerMobile,
      'Token Called - Proceed to Weighbridge',
      `Token ${waitingBooking.tokenNumber} has been called at Counter #1. Please proceed for vehicle weighment and moisture inspection.`,
      'CALLED_ALERT'
    );

    const audit = logAudit(
      'operator_desk',
      'OPERATOR',
      'QUEUE_TOKEN_CALLED',
      'QUEUE',
      waitingBooking.tokenNumber,
      `Called Token ${waitingBooking.tokenNumber} for ${waitingBooking.farmerName} at ${centre.name}`,
      'INFO'
    );

    persistAndNotify((prev) => {
      const updatedBookings = prev.bookings.map((b) => {
        if (b.id === waitingBooking.id) {
          return {
            ...b,
            status: 'CALLED' as const,
            calledAt: new Date().toISOString(),
          };
        }
        // Adjust queue positions for others waiting
        if (b.centreId === centreId && b.status === 'WAITING') {
          const newPos = Math.max(1, b.queuePosition - 1);
          return {
            ...b,
            queuePosition: newPos,
            estimatedWaitMinutes: Math.round((newPos / (centre.processingRatePerHour || 8)) * 60),
          };
        }
        return b;
      });

      return {
        ...prev,
        bookings: updatedBookings,
        notifications: [notif, ...prev.notifications],
        auditLogs: [audit, ...prev.auditLogs],
        activeToast: {
          title: `Called Token ${waitingBooking.tokenNumber}`,
          message: `SMS sent to ${waitingBooking.farmerName} (+91-${waitingBooking.farmerMobile})`,
          type: 'info',
        },
      };
    });

    // Notify backend real-time layer
    fetch('/api/queue/call-next', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ centreId }),
    }).catch(() => {});
  };

  /**
   * Operator Action: Mark Token as Processing (Weighment & Inspection started)
   */
  const markTokenProcessing = (tokenNumber: string) => {
    const booking = globalState.bookings.find((b) => b.tokenNumber === tokenNumber);
    if (!booking) return;

    persistAndNotify((prev) => {
      const updatedBookings = prev.bookings.map((b) =>
        b.id === booking.id
          ? { ...b, status: 'PROCESSING' as const, processingStartedAt: new Date().toISOString() }
          : b
      );

      const updatedCentres = prev.centres.map((c) =>
        c.id === booking.centreId
          ? { ...c, currentlyProcessing: c.currentlyProcessing + 1 }
          : c
      );

      const audit = logAudit(
        'operator_desk',
        'OPERATOR',
        'WEIGHMENT_STARTED',
        'QUEUE',
        tokenNumber,
        `Token ${tokenNumber} inspection and weighment in progress`,
        'INFO'
      );

      return {
        ...prev,
        bookings: updatedBookings,
        centres: updatedCentres,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });

    // Notify backend real-time layer
    fetch('/api/queue/mark-processing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenNumber, centreId: booking.centreId }),
    }).catch(() => {});
  };

  /**
   * Operator Action: Complete Procurement, record weighment, trigger payment
   */
  const completeProcurement = (
    tokenNumber: string,
    actualQuintals: number,
    qualityGrade: 'Grade A (FAQ)' | 'Grade B' | 'Standard' = 'Grade A (FAQ)'
  ) => {
    const booking = globalState.bookings.find((b) => b.tokenNumber === tokenNumber);
    if (!booking) return;

    const rate = MSP_RATES[booking.crop] || 7000;
    const totalAmount = Math.round(actualQuintals * rate);
    const weighmentSlip = `WS-${booking.centreId.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProc: ProcurementRecord = {
      id: `proc-${Date.now()}`,
      bookingId: booking.id,
      tokenNumber: booking.tokenNumber,
      farmerId: booking.farmerId,
      farmerName: booking.farmerName,
      centreId: booking.centreId,
      centreName: booking.centreName,
      crop: booking.crop,
      quantityQuintals: actualQuintals,
      qualityGrade,
      mspRatePerQuintal: rate,
      totalAmount,
      operatorId: 'op-1',
      operatorName: 'Vikas Deshmukh (Inspector #4)',
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      weighmentSlipNumber: weighmentSlip,
    };

    // Auto-trigger payment record in INITIATED / PROCESSING state
    const paymentRef = `PX-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      procurementId: newProc.id,
      bookingId: booking.id,
      farmerId: booking.farmerId,
      farmerName: booking.farmerName,
      farmerMobile: booking.farmerMobile,
      amount: totalAmount,
      status: 'PROCESSING',
      referenceNumber: paymentRef,
      paymentMethod: 'Prototype PFMS Simulation',
      initiatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const notif = dispatchNotification(
      booking.farmerId,
      booking.farmerMobile,
      'Procurement Verified & Payment Initiated',
      `Procurement slip ${weighmentSlip} generated for ${actualQuintals} Qtl ${booking.crop}. Payment of ₹${totalAmount.toLocaleString('en-IN')} initiated (Ref: ${paymentRef}).`,
      'PROCUREMENT_DONE'
    );

    const audit = logAudit(
      'operator_desk',
      'OPERATOR',
      'PROCUREMENT_COMPLETED',
      'PROCUREMENT',
      newProc.id,
      `Completed ${actualQuintals} Qtl ${booking.crop} for ₹${totalAmount}. Slip: ${weighmentSlip}`,
      'SUCCESS'
    );

    persistAndNotify((prev) => {
      const updatedBookings = prev.bookings.map((b) =>
        b.id === booking.id
          ? { ...b, status: 'COMPLETED' as const, completedAt: new Date().toISOString(), queuePosition: 0, estimatedWaitMinutes: 0 }
          : b
      );

      const updatedCentres = prev.centres.map((c) => {
        if (c.id === booking.centreId) {
          return {
            ...c,
            currentQueueLength: Math.max(0, c.currentQueueLength - 1),
            currentlyProcessing: Math.max(0, c.currentlyProcessing - 1),
            completedTodayCount: c.completedTodayCount + 1,
          };
        }
        return c;
      });

      return {
        ...prev,
        bookings: updatedBookings,
        centres: updatedCentres,
        procurements: [newProc, ...prev.procurements],
        payments: [newPayment, ...prev.payments],
        notifications: [notif, ...prev.notifications],
        auditLogs: [audit, ...prev.auditLogs],
        activeToast: {
          title: 'Procurement Verified!',
          message: `₹${totalAmount.toLocaleString('en-IN')} payment initiated for ${booking.farmerName}.`,
          type: 'success',
        },
      };
    });

    // Notify backend real-time layer
    fetch('/api/queue/mark-completed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenNumber,
        centreId: booking.centreId,
        actualQuintals,
        qualityGrade,
      }),
    }).catch(() => {});
  };

  /**
   * Simulate Payment Transfer (e.g. PFMS batch or Razorpay simulation)
   */
  const simulatePaymentSuccess = (paymentId: string) => {
    const payment = globalState.payments.find((p) => p.id === paymentId);
    if (!payment) return;

    const notif = dispatchNotification(
      payment.farmerId,
      payment.farmerMobile,
      'Payment Credited: PAID',
      `Your procurement payment of ₹${payment.amount.toLocaleString('en-IN')} has been credited to bank account ending in **4509. Ref: ${payment.referenceNumber}. (Prototype Simulation)`,
      'PAYMENT_UPDATE'
    );

    const audit = logAudit(
      'payment_gateway_mock',
      'SYSTEM',
      'PAYMENT_STATUS_PAID',
      'PAYMENT',
      payment.id,
      `Simulated settlement of ₹${payment.amount} to farmer ${payment.farmerName}. Ref: ${payment.referenceNumber}`,
      'SUCCESS'
    );

    persistAndNotify((prev) => {
      const updatedPayments = prev.payments.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'PAID' as const,
              updatedAt: new Date().toISOString(),
              paidAt: new Date().toISOString(),
            }
          : p
      );

      return {
        ...prev,
        payments: updatedPayments,
        notifications: [notif, ...prev.notifications],
        auditLogs: [audit, ...prev.auditLogs],
        activeToast: {
          title: 'Payment Credited (Simulated)',
          message: `₹${payment.amount.toLocaleString('en-IN')} successfully marked as PAID.`,
          type: 'success',
        },
      };
    });
  };

  /**
   * Submit Farmer Feedback
   */
  const submitFeedback = (
    rating: number,
    waitingRating: number,
    staffRating: number,
    comment: string,
    centreId: string,
    tokenNumber: string
  ) => {
    const currentFarmer = globalState.farmers.find((f) => f.id === globalState.currentFarmerId);
    const centre = globalState.centres.find((c) => c.id === centreId);

    const newFeedback: FeedbackItem = {
      id: `fb-${Date.now()}`,
      farmerId: currentFarmer ? currentFarmer.id : 'unknown',
      farmerName: currentFarmer ? currentFarmer.name : 'Farmer',
      centreId,
      centreName: centre ? centre.name : 'Procurement Centre',
      tokenNumber,
      rating,
      waitingExperienceRating: waitingRating,
      staffBehaviorRating: staffRating,
      comment,
      submittedAt: new Date().toISOString(),
    };

    const audit = logAudit(
      currentFarmer ? currentFarmer.name : 'farmer',
      'FARMER',
      'FEEDBACK_SUBMITTED',
      'FARMER',
      newFeedback.id,
      `Rated ${rating}/5 stars for Token ${tokenNumber}`,
      'SUCCESS'
    );

    persistAndNotify((prev) => ({
      ...prev,
      feedback: [newFeedback, ...prev.feedback],
      auditLogs: [audit, ...prev.auditLogs],
      activeToast: {
        title: 'Feedback Received',
        message: 'Thank you for rating your procurement experience!',
        type: 'success',
      },
    }));
  };

  /**
   * Reset to Initial Demo State (Great for SIH Judges presentation)
   */
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    const reset = {
      currentRole: 'FARMER' as UserRole,
      language: 'en' as Language,
      currentFarmerId: 'farmer-1',
      selectedCentreId: 'centre-1',
      farmers: INITIAL_FARMERS,
      centres: INITIAL_CENTRES,
      bookings: INITIAL_BOOKINGS,
      procurements: INITIAL_PROCUREMENTS,
      payments: INITIAL_PAYMENTS,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
      feedback: INITIAL_FEEDBACK,
      activeToast: {
        title: 'Demo State Reset',
        message: 'Reloaded pristine representative dataset for SIH 26032 demo (7 calibrated sample tokens).',
        type: 'info',
      },
    };
    persistAndNotify(() => reset);

    // Also reset backend Redis & Mongo demo queue
    fetch('/api/queue/reset-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ centreId: 'centre-1' }),
    }).catch(() => {});
  };

  return {
    state,
    isRealTimeConnected,
    setRole,
    setLanguage,
    setSelectedCentre,
    setCurrentFarmer,
    clearToast,
    bookSlot,
    callNextFarmer,
    markTokenProcessing,
    completeProcurement,
    simulatePaymentSuccess,
    submitFeedback,
    resetDemoData,
  };
}
