import { TollCity, TollVehicleClass, RoutePreset, Language } from '../types';
import { getRouteDefinition, calculateToll } from './tollMatrix';
import { fetchOSRMRouteDistance, findPakistanCity } from './mapRoutes';

export interface RouteOptionComparison {
  id: string;
  nameEn: string;
  nameUr: string;
  routeType: 'motorway' | 'highway' | 'mixed' | 'custom';
  distanceKm: number;
  estimatedHours: number; // e.g. 3.5 hrs
  estimatedTimeFormattedEn: string; // e.g. "3 hrs 30 mins"
  estimatedTimeFormattedUr: string; // e.g. "3 گھنٹے 30 منٹ"
  tollCost: number;
  fuelCost: number;
  totalTripCost: number;
  isFastest?: boolean;
  isCheapest?: boolean;
  descriptionEn?: string;
  descriptionUr?: string;
}

export interface RouteComparisonResult {
  hasMultipleRoutes: boolean;
  routes: RouteOptionComparison[];
  fastestRoute?: RouteOptionComparison;
  cheapestRoute?: RouteOptionComparison;
  informationalNoticeEn?: string;
  informationalNoticeUr?: string;
}

/**
 * Calculates estimated driving time for commercial trucks/freight vehicles
 * Average speeds in Pakistan:
 * - Motorway: ~70-75 km/h
 * - National Highway / Mixed: ~50-55 km/h
 */
function estimateDrivingTime(distanceKm: number, routeType: string) {
  const avgSpeed = routeType === 'motorway' ? 72 : 52;
  const hoursDecimal = distanceKm / avgSpeed;
  const totalMins = Math.round(hoursDecimal * 60);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  return {
    hoursDecimal,
    formattedEn: hrs > 0 ? `${hrs}h ${mins}m` : `${mins} mins`,
    formattedUr: hrs > 0 ? `${hrs} گھنٹے ${mins} منٹ` : `${mins} منٹ`
  };
}

/**
 * Evaluates available route options for a given origin and destination pair
 * using existing tollMatrix definitions and user custom RoutePresets.
 * Strictly adheres to rule: If only 1 route option exists in data, does NOT fake
 * a synthetic option, but clearly presents the single route and reports the notice.
 */
export async function getRouteComparisonOptions(params: {
  origin: string;
  dest: string;
  fuelPrice: number;
  mileage: number;
  vehicleClass?: TollVehicleClass;
  customRoutes?: RoutePreset[];
}): Promise<RouteComparisonResult> {
  const {
    origin,
    dest,
    fuelPrice,
    mileage,
    vehicleClass = 'truck',
    customRoutes = []
  } = params;

  if (!origin || !dest || origin.toLowerCase() === dest.toLowerCase()) {
    return { hasMultipleRoutes: false, routes: [] };
  }

  const cleanOrigin = origin.trim();
  const cleanDest = dest.trim();
  const effectiveMileage = mileage > 0 ? mileage : 7;
  const effectiveFuelPrice = fuelPrice > 0 ? fuelPrice : 340;

  const candidateOptions: RouteOptionComparison[] = [];

  // 1. Check tollMatrix for official route definition
  const routeDef = getRouteDefinition(cleanOrigin as TollCity, cleanDest as TollCity);
  
  // Get base distance via OSRM / Haversine
  const osrmDist = await fetchOSRMRouteDistance(cleanOrigin, cleanDest);
  const fallbackDist = osrmDist && osrmDist > 0 ? osrmDist : 200;

  let matrixToll = 0;
  try {
    const tollCalc = calculateToll({
      from: cleanOrigin as TollCity,
      to: cleanDest as TollCity,
      vehicleClass,
      hasMtag: true
    });
    matrixToll = tollCalc.total || 0;
  } catch {
    matrixToll = 0;
  }

  if (routeDef) {
    const dist = fallbackDist;
    const timeEst = estimateDrivingTime(dist, routeDef.routeType);
    const fuelCost = Math.round((dist / effectiveMileage) * effectiveFuelPrice);
    const totalCost = fuelCost + matrixToll;

    candidateOptions.push({
      id: 'matrix-official-route',
      nameEn: routeDef.nameEn,
      nameUr: routeDef.nameUr,
      routeType: routeDef.routeType,
      distanceKm: dist,
      estimatedHours: timeEst.hoursDecimal,
      estimatedTimeFormattedEn: timeEst.formattedEn,
      estimatedTimeFormattedUr: timeEst.formattedUr,
      tollCost: matrixToll,
      fuelCost,
      totalTripCost: totalCost,
      descriptionEn: `Official Corridor: ${routeDef.routeType.toUpperCase()}`,
      descriptionUr: `آفیشل کوریڈور: ${routeDef.routeType === 'motorway' ? 'موٹروے' : routeDef.routeType === 'highway' ? 'قومی شاہراہ' : 'مکسڈ روٹ'}`
    });
  } else {
    // If not in matrix, use OSRM baseline
    const dist = fallbackDist;
    const timeEst = estimateDrivingTime(dist, 'highway');
    const fuelCost = Math.round((dist / effectiveMileage) * effectiveFuelPrice);
    const totalCost = fuelCost + matrixToll;

    candidateOptions.push({
      id: 'osrm-standard-route',
      nameEn: `${cleanOrigin} to ${cleanDest} Highway Route`,
      nameUr: `${cleanOrigin} تا ${cleanDest} ہائی وے روٹ`,
      routeType: 'highway',
      distanceKm: dist,
      estimatedHours: timeEst.hoursDecimal,
      estimatedTimeFormattedEn: timeEst.formattedEn,
      estimatedTimeFormattedUr: timeEst.formattedUr,
      tollCost: matrixToll,
      fuelCost,
      totalTripCost: totalCost,
      descriptionEn: 'Standard Highway Distance',
      descriptionUr: 'معیاری ہائی وے فاصلہ'
    });
  }

  // 2. Check user's saved custom routes for this origin & destination
  const matchingCustom = customRoutes.filter(r => {
    const oMatch = r.from.toLowerCase() === cleanOrigin.toLowerCase();
    const dMatch = r.to.toLowerCase() === cleanDest.toLowerCase();
    const oMatchRev = r.from.toLowerCase() === cleanDest.toLowerCase();
    const dMatchRev = r.to.toLowerCase() === cleanOrigin.toLowerCase();
    return (oMatch && dMatch) || (oMatchRev && dMatchRev);
  });

  for (const cr of matchingCustom) {
    // Avoid exact duplicate distance and toll
    const isDup = candidateOptions.some(
      c => Math.abs(c.distanceKm - cr.dist) < 5 && Math.abs(c.tollCost - cr.toll) < 50
    );
    if (!isDup) {
      const timeEst = estimateDrivingTime(cr.dist, 'mixed');
      const fuelCost = Math.round((cr.dist / effectiveMileage) * effectiveFuelPrice);
      const totalCost = fuelCost + cr.toll;

      candidateOptions.push({
        id: `custom-route-${cr.id}`,
        nameEn: `Custom Route (${cr.dist} km, Rs. ${cr.toll} Toll)`,
        nameUr: `محفوظ روٹ (${cr.dist} کلومیٹر، ٹول ${cr.toll} روپے)`,
        routeType: 'custom',
        distanceKm: cr.dist,
        estimatedHours: timeEst.hoursDecimal,
        estimatedTimeFormattedEn: timeEst.formattedEn,
        estimatedTimeFormattedUr: timeEst.formattedUr,
        tollCost: cr.toll,
        fuelCost,
        totalTripCost: totalCost,
        descriptionEn: 'User Saved Custom Preset',
        descriptionUr: 'صارف کا محفوظ کردہ روٹ پری سیٹ'
      });
    }
  }

  // Check if multiple distinct route options exist
  const hasMultiple = candidateOptions.length > 1;

  if (!hasMultiple) {
    const single = candidateOptions[0];
    single.isFastest = true;
    single.isCheapest = true;

    return {
      hasMultipleRoutes: false,
      routes: candidateOptions,
      fastestRoute: single,
      cheapestRoute: single,
      informationalNoticeEn:
        'Only one viable route currently exists in the dataset for this city pair. Alternate route comparison requires additional route data.',
      informationalNoticeUr:
        'اس شہروں کے جوڑے کے لیے فی الوقت صرف ایک روٹ ڈیٹا دستیاب ہے۔ متبادل روٹ کے تقابلی موازنے کے لیے مزید روٹ ڈیٹا درکار ہے۔'
    };
  }

  // Sort and mark Fastest (lowest estimatedHours) vs Cheapest (lowest totalTripCost)
  const sortedByTime = [...candidateOptions].sort((a, b) => a.estimatedHours - b.estimatedHours);
  const sortedByCost = [...candidateOptions].sort((a, b) => a.totalTripCost - b.totalTripCost);

  const fastest = sortedByTime[0];
  const cheapest = sortedByCost[0];

  fastest.isFastest = true;
  cheapest.isCheapest = true;

  return {
    hasMultipleRoutes: true,
    routes: candidateOptions,
    fastestRoute: fastest,
    cheapestRoute: cheapest
  };
}
