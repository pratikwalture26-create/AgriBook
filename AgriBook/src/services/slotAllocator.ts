/**
 * AgriBook AI Slot Allocator Engine
 * Smart India Hackathon 2026 (SIH26032)
 *
 * Transparent decision-making pipeline using:
 * 1. XGBoost predicted demand (demo/synthetic heuristic forecast)
 * 2. Current Redis queue state & live token counts
 * 3. Centre capacity & hourly processing rate
 * 4. Transit distance from farmer's selected location
 *
 * Computes a transparent composite Suitability Score (0-100 scale),
 * yields 3 distinct available centre options, highlights one as "RECOMMENDED",
 * and provides clear 4-point justification:
 * - lower expected waiting time
 * - available capacity
 * - lower congestion
 * - reasonable distance
 */

import {
  CropType,
  ProcurementCentre,
  RecommendedCentreSlot,
  TimeSlot,
  Farmer,
  ScoringBreakdown,
  RecommendationRationale,
} from '../types';
import { predictCentreDemand } from './xgboostEngine';

export interface AllocationAnalysis {
  recommendations: RecommendedCentreSlot[];
  topThreeOptions: RecommendedCentreSlot[];
  highCongestionAlert?: {
    congestedCentreName: string;
    congestedCentreQueue: number;
    recommendedAlternativeName: string;
    timeSavedMinutes: number;
  };
  selectedLocationName: string;
  weights: {
    wait: number;
    capacity: number;
    congestion: number;
    distance: number;
  };
}

export interface SmartAllocationOptions {
  locationId?: string;
  customLocationName?: string;
  quantityQuintals?: number;
  preferredDate?: string;
  simulatedExtraQueue?: Record<string, number>; // centreId -> extra queue depth
}

export interface DemoLocation {
  id: string;
  name: string;
  taluka: string;
  district: string;
  state: string;
  distancesToCentres: Record<string, number>; // centreId -> km
}

export const DEMO_FARMER_LOCATIONS: DemoLocation[] = [
  {
    id: 'loc-sawangi',
    name: 'Sawangi Meghe (Wardha)',
    taluka: 'Wardha',
    district: 'Wardha',
    state: 'Maharashtra',
    distancesToCentres: {
      'centre-1': 4.2,  // Wardha Central APMC Sub-Yard
      'centre-5': 14.5, // Hinganghat Cotton Yard
      'centre-3': 56.0, // Yavatmal Soyabean Kendra
      'centre-2': 72.0, // Amravati Cotton Mandi
      'centre-4': 74.0, // Nagpur Agro Hub
    },
  },
  {
    id: 'loc-hinganghat',
    name: 'Hinganghat Rural (Wardha)',
    taluka: 'Hinganghat',
    district: 'Wardha',
    state: 'Maharashtra',
    distancesToCentres: {
      'centre-5': 3.5,  // Hinganghat Cotton Yard
      'centre-1': 24.5, // Wardha Central APMC
      'centre-3': 58.0, // Yavatmal Soyabean Kendra
      'centre-4': 86.0, // Nagpur Agro Hub
      'centre-2': 94.0, // Amravati Cotton Mandi
    },
  },
  {
    id: 'loc-darwha',
    name: 'Darwha Rural (Yavatmal)',
    taluka: 'Darwha',
    district: 'Yavatmal',
    state: 'Maharashtra',
    distancesToCentres: {
      'centre-3': 8.5,  // Yavatmal Soyabean Kendra
      'centre-1': 48.0, // Wardha Central APMC
      'centre-5': 52.0, // Hinganghat Cotton Yard
      'centre-2': 64.0, // Amravati Cotton Mandi
      'centre-4': 110.0, // Nagpur Agro Hub
    },
  },
  {
    id: 'loc-kalmeshwar',
    name: 'Kalmeshwar (Nagpur)',
    taluka: 'Kalmeshwar',
    district: 'Nagpur',
    state: 'Maharashtra',
    distancesToCentres: {
      'centre-4': 3.2,  // Nagpur Agro Hub
      'centre-1': 68.0, // Wardha Central APMC
      'centre-5': 78.0, // Hinganghat Cotton Yard
      'centre-2': 82.0, // Amravati Cotton Mandi
      'centre-3': 95.0, // Yavatmal Soyabean Kendra
    },
  },
  {
    id: 'loc-seloo',
    name: 'Seloo Block (Wardha)',
    taluka: 'Seloo',
    district: 'Wardha',
    state: 'Maharashtra',
    distancesToCentres: {
      'centre-1': 16.5, // Wardha Central APMC
      'centre-5': 32.0, // Hinganghat Cotton Yard
      'centre-4': 58.0, // Nagpur Agro Hub
      'centre-3': 62.0, // Yavatmal Soyabean Kendra
      'centre-2': 76.0, // Amravati Cotton Mandi
    },
  },
  {
    id: 'loc-deoli',
    name: 'Deoli Taluka (Wardha)',
    taluka: 'Deoli',
    district: 'Wardha',
    state: 'Maharashtra',
    distancesToCentres: {
      'centre-1': 18.0, // Wardha Central APMC
      'centre-5': 19.5, // Hinganghat Cotton Yard
      'centre-3': 44.0, // Yavatmal Soyabean Kendra
      'centre-2': 68.0, // Amravati Cotton Mandi
      'centre-4': 75.0, // Nagpur Agro Hub
    },
  },
];

export function getDistanceForLocation(locationIdOrName: string, centreId: string): number {
  const matchedLoc = DEMO_FARMER_LOCATIONS.find(
    (l) => l.id === locationIdOrName || l.name.toLowerCase().includes(locationIdOrName.toLowerCase())
  );
  if (matchedLoc && matchedLoc.distancesToCentres[centreId] !== undefined) {
    return matchedLoc.distancesToCentres[centreId];
  }
  return 15.0; // Default fallback distance
}

export function evaluateSmartSlotAllocation(
  farmer: Farmer,
  crop: CropType,
  centres: ProcurementCentre[],
  preferredDate: string = '2026-09-18',
  options?: SmartAllocationOptions
): AllocationAnalysis {
  // Determine location
  const locId = options?.locationId;
  const matchedLocation =
    (locId && DEMO_FARMER_LOCATIONS.find((l) => l.id === locId)) ||
    DEMO_FARMER_LOCATIONS.find((l) => l.name.toLowerCase().includes(farmer.village.toLowerCase())) ||
    DEMO_FARMER_LOCATIONS[0];

  const locationName = options?.customLocationName || matchedLocation.name;

  // Filter centres that support the crop
  const eligibleCentres = centres.filter((c) => c.supportedCrops.includes(crop));

  // Score weighting weights (strictly transparent)
  // 35% Expected wait time, 25% Available capacity, 20% Congestion probability, 20% Distance
  const weights = {
    wait: 0.35,
    capacity: 0.25,
    congestion: 0.20,
    distance: 0.20,
  };

  // Evaluate each centre
  interface CentreEvaluation {
    centre: ProcurementCentre;
    effectiveQueue: number;
    effectiveDistanceKm: number;
    waitMinutes: number;
    availableCapacity: number;
    forecast: ReturnType<typeof predictCentreDemand>;
    breakdown: ScoringBreakdown;
    recommendedSlot: TimeSlot;
  }

  const evaluations: CentreEvaluation[] = [];

  for (const centre of eligibleCentres) {
    // Check if extra simulated queue applies
    const extraQueue = options?.simulatedExtraQueue?.[centre.id] || 0;
    const effectiveQueue = centre.currentQueueLength + extraQueue;

    // Distance calculation
    const effectiveDistanceKm =
      matchedLocation.distancesToCentres[centre.id] ?? (centre.distanceKm || 15);

    // XGBoost synthetic demand forecast
    const forecast = predictCentreDemand(
      { ...centre, currentQueueLength: effectiveQueue },
      crop,
      preferredDate
    );

    // 1. Expected Waiting Time (Minutes) = (Queue Length / Hourly Rate) * 60
    const processingRate = Math.max(1, centre.processingRatePerHour || 8);
    const waitMinutes = Math.round((effectiveQueue / processingRate) * 60);

    // Wait Score: 0 to 100 scale (Lower wait time = Higher Score)
    // < 20 mins -> 95-100, 60 mins -> ~60, 120 mins -> ~20, >150 mins -> 5
    const waitScore = Math.max(5, Math.min(100, Math.round(100 - waitMinutes * 0.65)));

    // 2. Available Capacity Score:
    // Open capacity remaining today
    const availableCapacity = Math.max(
      0,
      centre.dailyCapacity - centre.completedTodayCount - effectiveQueue
    );
    const capacityRatio = availableCapacity / (centre.dailyCapacity || 1);
    const capacityScore = Math.max(5, Math.min(100, Math.round(capacityRatio * 100)));

    // 3. Congestion / XGBoost Demand Score:
    // Based on predicted arrival surge & congestion probability
    const congestionScore = Math.max(
      5,
      Math.min(100, Math.round(100 - forecast.congestionProbability * 85))
    );

    // 4. Distance Score:
    // Closer = Higher score (e.g. 4km = ~94, 15km = ~78, 30km = ~55, 60km = ~16)
    const distanceScore = Math.max(
      5,
      Math.min(100, Math.round(100 - effectiveDistanceKm * 1.45))
    );

    // Composite Suitability Index (0-100 scale, higher is better)
    const compositeSuitability = Math.round(
      weights.wait * waitScore +
      weights.capacity * capacityScore +
      weights.congestion * congestionScore +
      weights.distance * distanceScore
    );

    // Pick best available slot in this centre
    const openSlots = centre.slots.filter((s) => s.bookedCount < s.capacity);
    const chosenSlot =
      openSlots.find((s) => s.isRecommended) ||
      openSlots[0] ||
      centre.slots[0];

    evaluations.push({
      centre,
      effectiveQueue,
      effectiveDistanceKm,
      waitMinutes,
      availableCapacity,
      forecast,
      breakdown: {
        waitMinutes,
        waitScore,
        availableSlots: availableCapacity,
        totalCapacity: centre.dailyCapacity,
        capacityScore,
        predictedArrivals: forecast.predictedDemand,
        congestionProbability: forecast.congestionProbability,
        congestionScore,
        distanceKm: Math.round(effectiveDistanceKm * 10) / 10,
        distanceScore,
        compositeSuitability,
      },
      recommendedSlot: chosenSlot,
    });
  }

  // Sort descending by compositeSuitability (Highest score first)
  evaluations.sort((a, b) => b.breakdown.compositeSuitability - a.breakdown.compositeSuitability);

  // Take top 3 options
  const topThreeEvaluations = evaluations.slice(0, 3);

  // Generate 4-point explainable rationale for each option
  const recommendedSlots: RecommendedCentreSlot[] = topThreeEvaluations.map((item, idx) => {
    const isRecommended = idx === 0;
    const rank = idx + 1;
    const b = item.breakdown;
    const c = item.centre;

    let lowerWaitTime: string;
    let availableCapacityText: string;
    let lowerCongestionText: string;
    let reasonableDistanceText: string;
    let summary: string;

    if (isRecommended) {
      lowerWaitTime = `Estimated wait is ~${b.waitMinutes} mins (${item.effectiveQueue} tokens in Redis queue at ${c.processingRatePerHour}/hr throughput), saving considerable queueing delay.`;
      availableCapacityText = `Healthy capacity with ${b.availableSlots} open slots remaining today (${Math.round((b.availableSlots / c.dailyCapacity) * 100)}% unutilized quota).`;
      lowerCongestionText = `XGBoost forecast projects ${item.forecast.predictedCongestionLevel} congestion (${Math.round(b.congestionProbability * 100)}% load index), avoiding bottlenecks.`;
      reasonableDistanceText = `${b.distanceKm} km from ${locationName} (~${Math.round(b.distanceKm * 1.5)} mins transit time by tractor or truck).`;
      summary = `Optimal overall balance: low wait time (~${b.waitMinutes}m), ample capacity (${b.availableSlots} slots), and reasonable distance (${b.distanceKm}km).`;
    } else {
      // Comparison text for non-recommended alternatives
      const topOption = topThreeEvaluations[0];
      const waitDiff = b.waitMinutes - topOption.breakdown.waitMinutes;

      lowerWaitTime = waitDiff > 0
        ? `Longer wait of ~${b.waitMinutes} mins (${item.effectiveQueue} in queue, +${waitDiff} mins slower than ${topOption.centre.name}).`
        : `Quick wait of ~${b.waitMinutes} mins, but offset by distance or capacity constraints.`;

      availableCapacityText = `${b.availableSlots} of ${c.dailyCapacity} quota remaining (${Math.round((b.availableSlots / c.dailyCapacity) * 100)}% capacity open).`;

      lowerCongestionText = `XGBoost predicts ${item.forecast.predictedCongestionLevel} load (${Math.round(b.congestionProbability * 100)}% congestion probability).`;

      reasonableDistanceText = `${b.distanceKm} km transit distance from ${locationName}.`;

      summary = waitDiff > 20
        ? `Functional alternative, but queue depth adds ~${waitDiff} extra minutes of waiting compared to the recommended yard.`
        : `Viable backup centre with ${b.availableSlots} slots open, but suitability score (${b.compositeSuitability}/100) is slightly lower.`;
    }

    const rationale: RecommendationRationale = {
      lowerWaitTime,
      availableCapacity: availableCapacityText,
      lowerCongestion: lowerCongestionText,
      reasonableDistance: reasonableDistanceText,
      summary,
    };

    return {
      centre: {
        ...c,
        currentQueueLength: item.effectiveQueue,
        distanceKm: b.distanceKm,
      },
      recommendedSlot: {
        ...item.recommendedSlot,
        isRecommended,
      },
      suitabilityScore: Math.round((1 - b.compositeSuitability / 100) * 100) / 100, // lower was better in legacy code
      suitabilityIndex: b.compositeSuitability, // 0 to 100 transparent score (higher is better)
      isRecommended,
      rank,
      reason: summary,
      rationale,
      breakdown: b,
      isAlternativeRecommendation: !isRecommended,
      alternativeToCentreName: isRecommended ? undefined : topThreeEvaluations[0].centre.name,
    };
  });

  // High Congestion Alert detection
  let highCongestionAlert: AllocationAnalysis['highCongestionAlert'] = undefined;
  const congestedOption = evaluations.find(
    (e) => e.forecast.predictedCongestionLevel === 'HIGH' || e.effectiveQueue >= 30
  );

  if (congestedOption && recommendedSlots.length > 0) {
    const recommended = recommendedSlots[0];
    if (congestedOption.centre.id !== recommended.centre.id) {
      const waitDiff = Math.max(15, congestedOption.waitMinutes - recommended.breakdown.waitMinutes);
      highCongestionAlert = {
        congestedCentreName: congestedOption.centre.name,
        congestedCentreQueue: congestedOption.effectiveQueue,
        recommendedAlternativeName: recommended.centre.name,
        timeSavedMinutes: waitDiff,
      };
    }
  }

  return {
    recommendations: recommendedSlots,
    topThreeOptions: recommendedSlots,
    highCongestionAlert,
    selectedLocationName: locationName,
    weights,
  };
}

