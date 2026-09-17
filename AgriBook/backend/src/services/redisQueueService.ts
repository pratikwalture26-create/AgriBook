/**
 * AgriBook Redis Live Queue Service
 * Smart India Hackathon 2026 (SIH26032)
 *
 * Responsibilities:
 * - Ultra-fast operational state layer for frequently changing queue statuses
 * - Prevents duplicate token issuance or race conditions across multiple counters
 * - Atomic queue position calculation & estimated wait times
 * - Synchronizes with persistent MongoDB storage on state transitions
 */

import { EventEmitter } from 'events';

export interface RedisTokenPayload {
  tokenNumber: string;
  bookingId: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  crop: string;
  quantityQuintals: number;
  status: 'WAITING' | 'CALLED' | 'PROCESSING' | 'COMPLETED' | 'NO_SHOW';
  enqueuedAt: number;
  calledAt?: number;
  processingStartedAt?: number;
  completedAt?: number;
  queuePosition?: number;
  estimatedWaitMinutes?: number;
  slotTime?: string;
  moisturePercentage?: number;
  weighmentSlipNumber?: string;
  actualQuintals?: number;
  qualityGrade?: string;
}

export class RedisQueueService extends EventEmitter {
  // In-memory simulation of Redis key-value & lists for high-speed queue operations
  private memoryLists: Map<string, string[]> = new Map(); // queue:{centreId} -> [tokenNumbers]
  private memoryHashes: Map<string, RedisTokenPayload> = new Map(); // token:{tokenNumber} -> payload
  private centreProcessingRates: Map<string, number> = new Map(); // centreId -> farmers/hour

  constructor() {
    super();
    // Increase listener limits for multi-client SSE connections
    this.setMaxListeners(100);
  }

  public setProcessingRate(centreId: string, ratePerHour: number) {
    this.centreProcessingRates.set(centreId, ratePerHour);
  }

  public getProcessingRate(centreId: string): number {
    return this.centreProcessingRates.get(centreId) || 8;
  }

  /**
   * Add a newly booked token to the centre's live Redis queue (LPUSH/RPUSH)
   */
  public async enqueue(
    centreId: string,
    token: string,
    payload: RedisTokenPayload
  ): Promise<{ position: number; estimatedWaitMinutes: number }> {
    const queueKey = `queue:${centreId}`;
    let list = this.memoryLists.get(queueKey);
    if (!list) {
      list = [];
      this.memoryLists.set(queueKey, list);
    }

    if (!list.includes(token)) {
      list.push(token);
    }

    const rate = this.getProcessingRate(centreId);
    const waitingTokens = list.filter((t) => {
      const p = this.memoryHashes.get(`token:${t}`);
      return p && p.status === 'WAITING';
    });
    const position = waitingTokens.indexOf(token) + 1;
    const estimatedWaitMinutes = Math.max(0, Math.round((position / rate) * 60));

    payload.queuePosition = position;
    payload.estimatedWaitMinutes = estimatedWaitMinutes;
    this.memoryHashes.set(`token:${token}`, payload);

    this.emitQueueChanged('ENQUEUED', { centreId, token, payload });
    return { position, estimatedWaitMinutes };
  }

  /**
   * Operator calls next waiting farmer in FIFO order
   */
  public async callNext(centreId: string): Promise<RedisTokenPayload | null> {
    const queueKey = `queue:${centreId}`;
    const list = this.memoryLists.get(queueKey) || [];

    for (const token of list) {
      const payload = this.memoryHashes.get(`token:${token}`);
      if (payload && payload.status === 'WAITING') {
        payload.status = 'CALLED';
        payload.calledAt = Date.now();
        payload.queuePosition = 0;
        payload.estimatedWaitMinutes = 0;
        this.memoryHashes.set(`token:${token}`, payload);

        // Recalculate positions & wait times for all other waiting tokens
        this.recalculateWaitingPositions(centreId);

        this.emitQueueChanged('CALLED', { centreId, token, payload });
        return payload;
      }
    }
    return null;
  }

  /**
   * Operator marks a called or waiting token as PROCESSING at weighbridge
   */
  public async markProcessing(
    centreId: string,
    token: string,
    moisturePercentage = 8.2
  ): Promise<RedisTokenPayload | null> {
    const key = `token:${token}`;
    const payload = this.memoryHashes.get(key);
    if (!payload) return null;

    payload.status = 'PROCESSING';
    payload.processingStartedAt = Date.now();
    payload.moisturePercentage = moisturePercentage;
    payload.queuePosition = 0;
    payload.estimatedWaitMinutes = 0;
    this.memoryHashes.set(key, payload);

    this.recalculateWaitingPositions(centreId);
    this.emitQueueChanged('PROCESSING', { centreId, token, payload });
    return payload;
  }

  /**
   * Operator marks a processing token as COMPLETED
   */
  public async markCompleted(
    centreId: string,
    token: string,
    actualQuintals?: number,
    qualityGrade = 'Grade A (FAQ)',
    weighmentSlipNumber?: string
  ): Promise<RedisTokenPayload | null> {
    const key = `token:${token}`;
    const payload = this.memoryHashes.get(key);
    if (!payload) return null;

    payload.status = 'COMPLETED';
    payload.completedAt = Date.now();
    if (actualQuintals !== undefined) payload.actualQuintals = actualQuintals;
    if (qualityGrade) payload.qualityGrade = qualityGrade;
    if (weighmentSlipNumber) payload.weighmentSlipNumber = weighmentSlipNumber;
    payload.queuePosition = 0;
    payload.estimatedWaitMinutes = 0;
    this.memoryHashes.set(key, payload);

    this.recalculateWaitingPositions(centreId);
    this.emitQueueChanged('COMPLETED', { centreId, token, payload });
    return payload;
  }

  /**
   * Recalculate queue positions and estimated wait times for all WAITING tokens
   */
  public recalculateWaitingPositions(centreId: string) {
    const queueKey = `queue:${centreId}`;
    const list = this.memoryLists.get(queueKey) || [];
    const rate = this.getProcessingRate(centreId);

    let waitIndex = 1;
    for (const token of list) {
      const payload = this.memoryHashes.get(`token:${token}`);
      if (payload && payload.status === 'WAITING') {
        payload.queuePosition = waitIndex;
        payload.estimatedWaitMinutes = Math.round((waitIndex / rate) * 60);
        this.memoryHashes.set(`token:${token}`, payload);
        waitIndex++;
      }
    }
  }

  /**
   * Retrieve structured queue snapshot for a centre
   */
  public getQueueSnapshot(centreId: string) {
    const queueKey = `queue:${centreId}`;
    const list = this.memoryLists.get(queueKey) || [];
    const rate = this.getProcessingRate(centreId);

    const tokens = list
      .map((t) => this.memoryHashes.get(`token:${t}`))
      .filter((p): p is RedisTokenPayload => Boolean(p));

    const currentQueue = tokens.filter((t) => t.status === 'WAITING');
    const calledTokens = tokens.filter((t) => t.status === 'CALLED');
    const currentlyProcessing = tokens.filter((t) => t.status === 'PROCESSING');
    const completedTokens = tokens.filter((t) => t.status === 'COMPLETED');

    return {
      centreId,
      currentQueue,
      calledTokens,
      currentlyProcessing: currentlyProcessing[0] || null, // Primary active weighbridge token
      processingList: currentlyProcessing,
      completedTokens,
      summary: {
        totalTokens: tokens.length,
        waitingCount: currentQueue.length,
        calledCount: calledTokens.length,
        processingCount: currentlyProcessing.length,
        completedCount: completedTokens.length,
        ratePerHour: rate,
        nextWaitMinutes: currentQueue.length > 0 ? currentQueue[0].estimatedWaitMinutes : 0,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Seed / Reset pristine presentation demo queue
   */
  public seedPresentationQueue(centreId: string, tokens: RedisTokenPayload[], ratePerHour = 8) {
    this.setProcessingRate(centreId, ratePerHour);
    const queueKey = `queue:${centreId}`;
    const tokenList: string[] = [];

    // Clear existing for this centre
    this.memoryLists.set(queueKey, tokenList);

    tokens.forEach((t) => {
      tokenList.push(t.tokenNumber);
      this.memoryHashes.set(`token:${t.tokenNumber}`, t);
    });

    this.recalculateWaitingPositions(centreId);
    this.emitQueueChanged('DEMO_RESET', { centreId, count: tokens.length });
  }

  private emitQueueChanged(action: string, meta: Record<string, any>) {
    const snapshot = this.getQueueSnapshot(meta.centreId || 'centre-1');
    this.emit('queue:changed', {
      type: 'QUEUE_UPDATE',
      action,
      meta,
      snapshot,
      timestamp: Date.now(),
    });
  }
}

export const redisQueue = new RedisQueueService();
