/**
 * AgriBook REST API Endpoints Router
 * Smart India Hackathon 2026 (SIH26032)
 * Ministry of Consumer Affairs, Food & Public Distribution
 *
 * Implements complete REST API for:
 * Flutter App -> Node.js Express -> MongoDB & Redis Queues
 */

import { Router, Request, Response } from 'express';
import { backendStore } from '../services/dataStore';
import { redisQueue } from '../services/redisQueueService';
import { notificationService } from '../services/notificationService';
import { paymentService } from '../services/paymentService';
import { predictCentreDemand } from '../../../src/services/xgboostEngine';
import { evaluateSmartSlotAllocation } from '../../../src/services/slotAllocator';
import { MSP_RATES } from '../../../src/data/sampleData';

export const apiRouter = Router();

// Enable CORS for Flutter Mobile / Web clients
apiRouter.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==========================================
// 1. AUTHENTICATION & PROFILE
// ==========================================

apiRouter.post('/auth/send-otp', async (req: Request, res: Response) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ success: false, error: 'Mobile number is required' });
  }

  const otp = '26032'; // Fixed evaluation demo OTP for SIH 26032
  await notificationService.sendSms({
    toMobile: mobile,
    messageBody: `Your AgriBook login OTP is ${otp}. Valid for 10 minutes. Do not share.`,
    templateType: 'OTP',
  });

  backendStore.logAudit(`Farmer (+91-${mobile})`, 'FARMER', 'REQUEST_OTP', 'AUTH', mobile, 'OTP dispatched via SMS');

  return res.json({
    success: true,
    message: 'OTP sent via Twilio SMS service',
    demoOtp: otp,
  });
});

apiRouter.post('/auth/verify-otp', (req: Request, res: Response) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    return res.status(400).json({ success: false, error: 'Mobile and OTP are required' });
  }

  if (otp === '26032' || otp === '123456') {
    const farmer = backendStore.farmers.find((f) => f.mobile === mobile) || backendStore.farmers[0];
    backendStore.logAudit(farmer.name, 'FARMER', 'LOGIN_SUCCESS', 'AUTH', farmer.id, 'Authenticated via OTP');

    return res.json({
      success: true,
      token: `jwt_agribook_${mobile}_${Date.now()}`,
      farmer,
    });
  }

  return res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
});

apiRouter.get('/farmers/profile', (req: Request, res: Response) => {
  const { mobile, id } = req.query;
  let farmer = null;
  if (id) {
    farmer = backendStore.farmers.find((f) => f.id === String(id));
  } else if (mobile) {
    farmer = backendStore.farmers.find((f) => f.mobile === String(mobile));
  } else {
    farmer = backendStore.farmers[0];
  }

  if (!farmer) {
    return res.status(404).json({ success: false, error: 'Farmer profile not found' });
  }

  return res.json({ success: true, farmer });
});

// ==========================================
// 2. PROCUREMENT CENTRES & SLOTS
// ==========================================

apiRouter.get('/centres', (req: Request, res: Response) => {
  return res.json({
    success: true,
    centres: backendStore.centres,
  });
});

apiRouter.get('/centres/nearby', (req: Request, res: Response) => {
  const { farmerId, crop = 'Cotton' } = req.query;
  const farmer = backendStore.farmers.find((f) => f.id === String(farmerId)) || backendStore.farmers[0];

  const analysis = evaluateSmartSlotAllocation(
    farmer as any,
    String(crop) as any,
    backendStore.centres as any,
    '2026-09-18'
  );

  return res.json({
    success: true,
    farmerLocation: `${farmer.village}, ${farmer.district}`,
    recommendations: analysis.recommendations,
    highCongestionAlert: analysis.highCongestionAlert,
  });
});

apiRouter.get('/centres/:id', (req: Request, res: Response) => {
  const centre = backendStore.centres.find((c) => c.id === req.params.id);
  if (!centre) {
    return res.status(404).json({ success: false, error: 'Centre not found' });
  }
  return res.json({ success: true, centre });
});

apiRouter.get('/slots/available', (req: Request, res: Response) => {
  const { centreId } = req.query;
  const centre = backendStore.centres.find((c) => c.id === String(centreId)) || backendStore.centres[0];
  return res.json({
    success: true,
    centreId: centre.id,
    centreName: centre.name,
    slots: centre.slots,
  });
});

apiRouter.post('/slots/recommend', (req: Request, res: Response) => {
  const {
    farmerId,
    crop = 'Cotton',
    quantityQuintals = 45,
    preferredDate = '2026-09-18',
    locationId,
    simulatedExtraQueue,
  } = req.body;
  const farmer = backendStore.farmers.find((f) => f.id === farmerId) || backendStore.farmers[0];

  const analysis = evaluateSmartSlotAllocation(
    farmer as any,
    crop,
    backendStore.centres as any,
    preferredDate,
    {
      locationId,
      quantityQuintals: Number(quantityQuintals),
      preferredDate,
      simulatedExtraQueue,
    }
  );

  return res.json({
    success: true,
    recommendations: analysis.recommendations,
    topThreeOptions: analysis.topThreeOptions,
    highCongestionAlert: analysis.highCongestionAlert,
    selectedLocationName: analysis.selectedLocationName,
    weights: analysis.weights,
    aiModelNotice:
      'Synthetic XGBoost decision tree demo model. Heuristic arrival prediction calibrated for SIH hackathon demonstration.',
  });
});

// ==========================================
// 3. BOOKINGS & TOKEN ISSUANCE
// ==========================================

apiRouter.post('/bookings', async (req: Request, res: Response) => {
  const { farmerId, centreId, slotTime, crop, quantityQuintals, date, bookingSource = 'APP' } = req.body;

  const farmer = backendStore.farmers.find((f) => f.id === farmerId) || backendStore.farmers[0];
  const centre = backendStore.centres.find((c) => c.id === centreId) || backendStore.centres[0];

  const tokenNumber = `${centre.code[0]}${Math.floor(100 + Math.random() * 900)}`;
  const bookingRef = `AGB-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  // Enqueue in Redis
  const { position, estimatedWaitMinutes } = await redisQueue.enqueue(centre.id, tokenNumber, {
    tokenNumber,
    bookingId: bookingRef,
    farmerId: farmer.id,
    farmerName: farmer.name,
    farmerMobile: farmer.mobile,
    crop,
    quantityQuintals: Number(quantityQuintals),
    status: 'WAITING',
    enqueuedAt: Date.now(),
  });

  const newBooking: any = {
    id: `booking-${Date.now()}`,
    bookingReference: bookingRef,
    tokenNumber,
    farmerId: farmer.id,
    farmerName: farmer.name,
    farmerMobile: farmer.mobile,
    centreId: centre.id,
    centreName: centre.name,
    crop,
    quantityQuintals: Number(quantityQuintals),
    date: date || '2026-09-18',
    slotTime,
    status: 'WAITING',
    queuePosition: position,
    estimatedWaitMinutes,
    bookingSource,
    createdAt: new Date(),
  };

  backendStore.bookings.unshift(newBooking);

  // Update centre queue metric
  centre.currentQueueLength += 1;

  // Send Twilio SMS confirmation
  await notificationService.sendSms({
    toMobile: farmer.mobile,
    messageBody: `AgriBook: Slot confirmed at ${centre.name} for ${crop} (${quantityQuintals} Qtl). Token: ${tokenNumber}, Slot: ${slotTime}. Live queue position: #${position}.`,
    templateType: 'SLOT_CONFIRMATION',
  });

  backendStore.logAudit(
    farmer.name,
    bookingSource === 'HELPLINE_OPERATOR' ? 'HELPLINE' : 'FARMER',
    'BOOK_SLOT',
    'BOOKING',
    tokenNumber,
    `Slot booked at ${centre.name} for ${slotTime}`
  );

  return res.json({
    success: true,
    booking: newBooking,
    tokenNumber,
    queuePosition: position,
    estimatedWaitMinutes,
  });
});

apiRouter.get('/bookings/:id', (req: Request, res: Response) => {
  const booking = backendStore.bookings.find((b) => b.id === req.params.id || b.tokenNumber === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }
  return res.json({ success: true, booking });
});

// ==========================================
// 4. LIVE QUEUE OPERATIONS (REDIS FAST LAYER & REAL-TIME SSE)
// ==========================================

// Real-Time Server-Sent Events (SSE) Stream
apiRouter.get('/queue/stream', (req: Request, res: Response) => {
  const centreId = String(req.query.centreId || 'centre-1');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Send initial snapshot
  const initialSnapshot = redisQueue.getQueueSnapshot(centreId);
  res.write(`data: ${JSON.stringify({ type: 'INIT_SYNC', snapshot: initialSnapshot })}\n\n`);

  // Event handler for real-time broadcasts
  const onQueueChanged = (payload: any) => {
    try {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {
      // client disconnected
    }
  };

  redisQueue.on('queue:changed', onQueueChanged);

  // Heartbeat ping every 15s to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch {
      clearInterval(heartbeat);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    redisQueue.off('queue:changed', onQueueChanged);
  });
});

// Full queue snapshot for a centre
apiRouter.get('/queue/:centreId/snapshot', async (req: Request, res: Response) => {
  const { centreId } = req.params;
  const snapshot = redisQueue.getQueueSnapshot(centreId);
  const centre = backendStore.centres.find((c) => c.id === centreId) || backendStore.centres[0];
  const centreProcurements = backendStore.procurements.filter((p) => p.centreId === centreId);

  return res.json({
    success: true,
    centre: {
      id: centre.id,
      name: centre.name,
      code: centre.code,
      processingRatePerHour: centre.processingRatePerHour,
    },
    ...snapshot,
    persistentProcurements: centreProcurements,
    storageArchitecture: {
      liveQueueEngine: 'Redis In-Memory Key-Value & FIFO State',
      persistenceEngine: 'MongoDB Documents (Bookings, Procurements, PFMS Ledger)',
      realTimeTransport: 'Node.js Real-Time Stream (SSE / Event Bus)',
    },
  });
});

// Backward compatible endpoint
apiRouter.get('/queue/:centreId', async (req: Request, res: Response) => {
  const { centreId } = req.params;
  const snapshot = redisQueue.getQueueSnapshot(centreId);
  const centre = backendStore.centres.find((c) => c.id === centreId) || backendStore.centres[0];

  return res.json({
    success: true,
    centreId: centre.id,
    centreName: centre.name,
    activeQueueDepth: snapshot.summary.waitingCount,
    tokens: [...snapshot.currentQueue, ...snapshot.calledTokens].map((b) => ({
      tokenNumber: b.tokenNumber,
      farmerName: b.farmerName,
      status: b.status,
      queuePosition: b.queuePosition,
      estimatedWaitMinutes: b.estimatedWaitMinutes,
      slotTime: b.slotTime,
      crop: b.crop,
    })),
  });
});

// CALL NEXT: Pops next waiting token in Redis FIFO, updates MongoDB booking, triggers SSE
apiRouter.post('/queue/call-next', async (req: Request, res: Response) => {
  const { centreId = 'centre-1' } = req.body;
  const centre = backendStore.centres.find((c) => c.id === centreId) || backendStore.centres[0];

  const calledToken = await redisQueue.callNext(centre.id);
  if (!calledToken) {
    return res.json({ success: false, message: 'Queue is currently empty - no farmers waiting' });
  }

  // Update persistent MongoDB booking document
  const booking = backendStore.bookings.find((b) => b.tokenNumber === calledToken.tokenNumber);
  if (booking) {
    booking.status = 'CALLED';
    booking.calledAt = new Date();
    booking.queuePosition = 0;
    booking.estimatedWaitMinutes = 0;
  }

  // Synchronize positions and estimated wait times for all remaining waiting bookings in MongoDB
  const snapshot = redisQueue.getQueueSnapshot(centre.id);
  snapshot.currentQueue.forEach((waitingToken) => {
    const b = backendStore.bookings.find((item) => item.tokenNumber === waitingToken.tokenNumber);
    if (b) {
      b.queuePosition = waitingToken.queuePosition || 1;
      b.estimatedWaitMinutes = waitingToken.estimatedWaitMinutes || 0;
    }
  });

  // Dispatch SMS
  await notificationService.sendSms({
    toMobile: calledToken.farmerMobile,
    messageBody: `AgriBook Alert: Token ${calledToken.tokenNumber} is CALLED at ${centre.name}! Please proceed to Weighbridge Counter #1 immediately.`,
    templateType: 'QUEUE_CALL',
  });

  backendStore.logAudit(
    'Mandi Gate Operator',
    'OPERATOR',
    'CALL_NEXT_TOKEN',
    'QUEUE',
    calledToken.tokenNumber,
    `Called token ${calledToken.tokenNumber} (${calledToken.farmerName}) to Weighbridge Gate`
  );

  return res.json({
    success: true,
    action: 'CALL_NEXT',
    calledToken,
    snapshot,
  });
});

// MARK PROCESSING: Moves token from CALLED/WAITING to PROCESSING at weighbridge
apiRouter.post('/queue/mark-processing', async (req: Request, res: Response) => {
  const { tokenNumber, centreId = 'centre-1', moisturePercentage = 8.2 } = req.body;
  const token = await redisQueue.markProcessing(centreId, tokenNumber, moisturePercentage);

  if (!token) {
    return res.status(404).json({ success: false, error: 'Token not found in Redis queue' });
  }

  // Update MongoDB booking
  const booking = backendStore.bookings.find((b) => b.tokenNumber === tokenNumber);
  if (booking) {
    booking.status = 'PROCESSING';
    booking.processingStartedAt = new Date();
    booking.queuePosition = 0;
    booking.estimatedWaitMinutes = 0;
  }

  backendStore.logAudit(
    'Weighbridge Inspector',
    'OPERATOR',
    'MARK_PROCESSING',
    'QUEUE',
    tokenNumber,
    `Weighment and moisture inspection started for ${token.crop} (${token.quantityQuintals} Qtl)`
  );

  const snapshot = redisQueue.getQueueSnapshot(centreId);
  return res.json({
    success: true,
    action: 'MARK_PROCESSING',
    token,
    snapshot,
  });
});

// Backward compatible endpoint
apiRouter.post('/queue/:token/processing', async (req: Request, res: Response) => {
  const { token } = req.params;
  const booking = backendStore.bookings.find((b) => b.tokenNumber === token);
  const centreId = booking?.centreId || 'centre-1';
  const updatedToken = await redisQueue.markProcessing(centreId, token);
  if (booking) {
    booking.status = 'PROCESSING';
    booking.processingStartedAt = new Date();
  }
  return res.json({ success: true, token: updatedToken, status: 'PROCESSING' });
});

// MARK COMPLETED: Records procurement, weighment slip, PFMS payment, and completes token
apiRouter.post('/queue/mark-completed', async (req: Request, res: Response) => {
  const {
    tokenNumber,
    centreId = 'centre-1',
    actualQuintals,
    qualityGrade = 'Grade A (FAQ)',
    operatorNotes = 'Standard FAQ quality accepted',
  } = req.body;

  const booking = backendStore.bookings.find((b) => b.tokenNumber === tokenNumber);
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  const finalQuintals = Number(actualQuintals || booking.quantityQuintals);
  const mspRate = MSP_RATES[booking.crop] || 7521;
  const totalAmount = Math.round(finalQuintals * mspRate);
  const slipNo = `WS-WRD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // Mark completed in Redis live state
  const completedToken = await redisQueue.markCompleted(
    centreId,
    tokenNumber,
    finalQuintals,
    qualityGrade,
    slipNo
  );

  // Mark completed in MongoDB persistent booking document
  booking.status = 'COMPLETED';
  booking.completedAt = new Date();
  booking.queuePosition = 0;
  booking.estimatedWaitMinutes = 0;

  // Create MongoDB Procurement Document
  const procRecord: any = {
    id: `proc-${Date.now()}`,
    bookingId: booking.id,
    tokenNumber,
    farmerId: booking.farmerId,
    farmerName: booking.farmerName,
    centreId: booking.centreId,
    crop: booking.crop,
    quantityQuintals: finalQuintals,
    qualityGrade,
    mspRatePerQuintal: mspRate,
    totalAmount,
    operatorId: 'OP-01',
    operatorName: 'Vikas Deshmukh (Inspector #4)',
    weighmentSlipNumber: slipNo,
    status: 'COMPLETED',
    createdAt: new Date(),
  };
  backendStore.procurements.unshift(procRecord);

  // Create MongoDB PFMS Payment Document
  const payRef = `PX-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const payRecord: any = {
    id: `pay-${Date.now()}`,
    procurementId: procRecord.id,
    bookingId: booking.id,
    farmerId: booking.farmerId,
    farmerName: booking.farmerName,
    farmerMobile: booking.farmerMobile,
    amount: totalAmount,
    status: 'PROCESSING',
    referenceNumber: payRef,
    paymentMethod: 'Direct Bank Transfer (PFMS Prototype)',
    initiatedAt: new Date(),
    updatedAt: new Date(),
  };
  backendStore.payments.unshift(payRecord);

  // Update centre statistics
  const centre = backendStore.centres.find((c) => c.id === centreId);
  if (centre) {
    centre.completedTodayCount += 1;
    if (centre.currentQueueLength > 0) centre.currentQueueLength -= 1;
  }

  // Send SMS confirmation to farmer
  await notificationService.sendSms({
    toMobile: booking.farmerMobile,
    messageBody: `AgriBook: Procurement finalized! Slip: ${slipNo}. ${finalQuintals} Qtl ${booking.crop} @ ₹${mspRate}/Qtl. Payout ₹${totalAmount.toLocaleString('en-IN')} initiated (PFMS Ref: ${payRef}).`,
    templateType: 'PROCUREMENT_DONE',
  });

  backendStore.logAudit(
    'Mandi Operator',
    'OPERATOR',
    'MARK_COMPLETED',
    'PROCUREMENT',
    slipNo,
    `Procurement recorded for ₹${totalAmount.toLocaleString('en-IN')} (${finalQuintals} Qtl ${booking.crop})`
  );

  const snapshot = redisQueue.getQueueSnapshot(centreId);
  return res.json({
    success: true,
    action: 'MARK_COMPLETED',
    token: completedToken,
    procurement: procRecord,
    payment: payRecord,
    snapshot,
  });
});

// Backward compatible endpoint
apiRouter.post('/queue/:token/completed', async (req: Request, res: Response) => {
  const { token } = req.params;
  const booking = backendStore.bookings.find((b) => b.tokenNumber === token);
  const centreId = booking?.centreId || 'centre-1';
  await redisQueue.markCompleted(centreId, token);
  if (booking) {
    booking.status = 'COMPLETED';
    booking.completedAt = new Date();
  }
  return res.json({ success: true, token, status: 'COMPLETED' });
});

// RESET DEMO: Restores pristine 5+ sample presentation tokens
apiRouter.post('/queue/reset-demo', async (req: Request, res: Response) => {
  const { centreId = 'centre-1' } = req.body;
  const snapshot = backendStore.resetPresentationDemo(centreId);

  backendStore.logAudit(
    'Demo Controller',
    'SYSTEM',
    'RESET_DEMO_QUEUE',
    'QUEUE',
    centreId,
    `Presentation queue reset with 5+ calibrated sample tokens`
  );

  return res.json({
    success: true,
    message: 'Demo queue reset successfully to 5+ sample presentation tokens',
    snapshot,
  });
});

// ==========================================
// 5. PROCUREMENT & PAYMENTS
// ==========================================

apiRouter.post('/procurement', async (req: Request, res: Response) => {
  const { tokenNumber, actualQuintals, qualityGrade = 'Grade A (FAQ)', operatorId = 'OP-01' } = req.body;

  const booking = backendStore.bookings.find((b) => b.tokenNumber === tokenNumber);
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking token not found' });
  }

  const farmer = backendStore.farmers.find((f) => f.id === booking.farmerId) || backendStore.farmers[0];
  const mspRate = MSP_RATES[booking.crop] || 7000;
  const totalAmount = Math.round(Number(actualQuintals) * mspRate);
  const slipNo = `WS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const procRecord: any = {
    id: `proc-${Date.now()}`,
    bookingId: booking.id,
    tokenNumber,
    farmerId: booking.farmerId,
    farmerName: booking.farmerName,
    centreId: booking.centreId,
    crop: booking.crop,
    quantityQuintals: Number(actualQuintals),
    qualityGrade,
    mspRatePerQuintal: mspRate,
    totalAmount,
    operatorId,
    weighmentSlipNumber: slipNo,
    status: 'COMPLETED',
    createdAt: new Date(),
  };

  backendStore.procurements.unshift(procRecord);

  // Mark booking completed
  booking.status = 'COMPLETED';
  booking.completedAt = new Date();

  // Automatically trigger payment record in PROCESSING state
  const payRef = `PX-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const payRecord: any = {
    id: `pay-${Date.now()}`,
    procurementId: procRecord.id,
    bookingId: booking.id,
    farmerId: farmer.id,
    farmerName: farmer.name,
    farmerMobile: farmer.mobile,
    amount: totalAmount,
    status: 'PROCESSING',
    referenceNumber: payRef,
    paymentMethod: 'Direct Bank Transfer (PFMS / Razorpay)',
    initiatedAt: new Date(),
    updatedAt: new Date(),
  };

  backendStore.payments.unshift(payRecord);

  // Send SMS
  await notificationService.sendSms({
    toMobile: farmer.mobile,
    messageBody: `AgriBook: Procurement finalized! Slip: ${slipNo}. ${actualQuintals} Qtl of ${booking.crop} accepted at MSP ₹${mspRate}. Payment of ₹${totalAmount.toLocaleString('en-IN')} initiated (Ref: ${payRef}).`,
    templateType: 'PROCUREMENT_DONE',
  });

  backendStore.logAudit(
    'Mandi Operator',
    'OPERATOR',
    'COMPLETE_PROCUREMENT',
    'PROCUREMENT',
    slipNo,
    `Procurement recorded for ₹${totalAmount.toLocaleString('en-IN')}`
  );

  return res.json({
    success: true,
    procurement: procRecord,
    payment: payRecord,
  });
});

apiRouter.post('/payments/trigger', async (req: Request, res: Response) => {
  const { procurementId, farmerId, amount, bankAccountLastFour } = req.body;
  const result = await paymentService.triggerPayment({
    procurementId,
    farmerId,
    amount,
    bankAccountLastFour,
  });
  return res.json(result);
});

apiRouter.post('/payments/:id/simulate', async (req: Request, res: Response) => {
  const { id } = req.params;
  const payment = backendStore.payments.find((p) => p.id === id || p.referenceNumber === id);
  if (payment) {
    payment.status = 'PAID';
    payment.paidAt = new Date();
  }
  const result = await paymentService.markPaid(payment?.referenceNumber || id);
  return res.json(result);
});

apiRouter.get('/payments/status/:referenceNumber', (req: Request, res: Response) => {
  const { referenceNumber } = req.params;
  const payment = backendStore.payments.find((p) => p.referenceNumber === referenceNumber || p.id === referenceNumber);
  if (!payment) {
    return res.status(404).json({ success: false, error: 'Payment record not found' });
  }
  return res.json({ success: true, payment });
});

// ==========================================
// 6. NOTIFICATIONS & FEEDBACK
// ==========================================

apiRouter.get('/notifications', (req: Request, res: Response) => {
  const { mobile } = req.query;
  let notifs = backendStore.auditLogs;
  return res.json({
    success: true,
    notifications: notifs,
  });
});

apiRouter.post('/feedback', (req: Request, res: Response) => {
  const { farmerId, centreId, tokenNumber, rating, waitingExperienceRating, staffBehaviorRating, comment } = req.body;
  const item: any = {
    id: `fb-${Date.now()}`,
    farmerId,
    centreId,
    tokenNumber,
    rating: Number(rating),
    waitingExperienceRating: Number(waitingExperienceRating),
    staffBehaviorRating: Number(staffBehaviorRating),
    comment: comment || '',
    createdAt: new Date(),
  };
  backendStore.feedback.push(item);
  backendStore.logAudit('Farmer', 'FARMER', 'SUBMIT_FEEDBACK', 'FEEDBACK', tokenNumber, `Rating ${rating} stars`);

  return res.json({ success: true, feedback: item });
});

// ==========================================
// 7. ADMIN DASHBOARD & AUDIT LOGS
// ==========================================

apiRouter.get('/admin/dashboard', (req: Request, res: Response) => {
  const totalFarmers = backendStore.farmers.length;
  const totalBookings = backendStore.bookings.length;
  const totalCompleted = backendStore.bookings.filter((b) => b.status === 'COMPLETED').length;
  const totalProcuredQuintals = backendStore.procurements.reduce((acc, p) => acc + p.quantityQuintals, 0);
  const totalProcuredAmount = backendStore.procurements.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalActiveQueues = backendStore.centres.reduce((acc, c) => acc + c.currentQueueLength, 0);

  const centreMatrix = backendStore.centres.map((c) => {
    const forecast = predictCentreDemand(c as any, 'Cotton');
    const loadPercent = Math.round(((c.currentQueueLength + c.completedTodayCount) / c.dailyCapacity) * 100);
    return {
      id: c.id,
      name: c.name,
      district: c.district,
      dailyCapacity: c.dailyCapacity,
      currentQueue: c.currentQueueLength,
      predictedDemand: forecast.predictedDemand,
      loadPercent,
      congestionLevel: c.congestionLevel,
    };
  });

  return res.json({
    success: true,
    kpis: {
      totalFarmers,
      totalBookings,
      totalCompleted,
      totalProcuredQuintals,
      totalProcuredAmount,
      totalActiveQueues,
    },
    centres: centreMatrix,
  });
});

apiRouter.get('/admin/audit', (req: Request, res: Response) => {
  return res.json({
    success: true,
    totalLogs: backendStore.auditLogs.length,
    auditLogs: backendStore.auditLogs,
  });
});

// Health check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'AgriBook Backend API',
    problemStatement: 'SIH26032',
    timestamp: new Date().toISOString(),
  });
});
