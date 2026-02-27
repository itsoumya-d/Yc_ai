import { supabase } from "@/lib/supabase";
import type { Job } from "@/types/index";

interface Location {
  lat: number;
  lng: number;
}

interface OptimizeRouteResult {
  optimizedJobs: Job[];
  totalDistanceMiles: number;
  estimatedMinutes: number;
  savings?: {
    distanceSaved: number;
    timeSaved: number;
  };
}

// Haversine distance calculation
function haversineDistance(a: Location, b: Location): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const chord =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinDLng * sinDLng;
  const dist = 2 * R * Math.asin(Math.sqrt(chord));
  return dist;
}

// Nearest-neighbor heuristic for TSP
function nearestNeighborTSP(jobs: Job[], startLocation: Location): Job[] {
  const jobsWithCoords = jobs.filter(
    (j) => j.lat !== null && j.lng !== null
  );
  const jobsWithoutCoords = jobs.filter(
    (j) => j.lat === null || j.lng === null
  );

  if (jobsWithCoords.length === 0) {
    return jobs;
  }

  const unvisited = [...jobsWithCoords];
  const route: Job[] = [];
  let currentLoc = startLocation;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDist = Infinity;

    unvisited.forEach((job, i) => {
      const dist = haversineDistance(currentLoc, {
        lat: job.lat!,
        lng: job.lng!,
      });

      // Priority weight: urgent = 0.5x distance, high = 0.75x
      const priorityFactor =
        job.priority === "urgent"
          ? 0.5
          : job.priority === "high"
          ? 0.75
          : 1.0;

      const weightedDist = dist * priorityFactor;

      if (weightedDist < nearestDist) {
        nearestDist = weightedDist;
        nearestIndex = i;
      }
    });

    const nearest = unvisited.splice(nearestIndex, 1)[0];
    route.push(nearest);
    currentLoc = { lat: nearest.lat!, lng: nearest.lng! };
  }

  return [...route, ...jobsWithoutCoords];
}

function calculateRouteMetrics(
  jobs: Job[],
  startLocation: Location
): { totalDistanceMiles: number; estimatedMinutes: number } {
  if (jobs.length === 0) {
    return { totalDistanceMiles: 0, estimatedMinutes: 0 };
  }

  let totalDistance = 0;
  let currentLoc = startLocation;

  for (const job of jobs) {
    if (job.lat && job.lng) {
      totalDistance += haversineDistance(currentLoc, {
        lat: job.lat,
        lng: job.lng,
      });
      currentLoc = { lat: job.lat, lng: job.lng };
    }
  }

  const drivingMinutes = (totalDistance / 30) * 60; // avg 30 mph
  const serviceMinutes = jobs.reduce(
    (sum, j) => sum + (j.estimated_duration ?? 60),
    0
  );
  const totalMinutes = drivingMinutes + serviceMinutes;

  return {
    totalDistanceMiles: Math.round(totalDistance * 10) / 10,
    estimatedMinutes: Math.round(totalMinutes),
  };
}

export async function optimizeRoute(
  jobs: Job[],
  startLocation: Location
): Promise<{ data?: OptimizeRouteResult; error?: string }> {
  if (jobs.length === 0) {
    return { error: "No jobs to optimize" };
  }

  try {
    // Original route metrics for comparison
    const originalMetrics = calculateRouteMetrics(jobs, startLocation);

    // Optimize with nearest-neighbor TSP
    const optimizedJobs = nearestNeighborTSP(jobs, startLocation);
    const optimizedMetrics = calculateRouteMetrics(optimizedJobs, startLocation);

    // Update route_order in database
    const orderUpdates = optimizedJobs.map((job, index) => ({
      id: job.id,
      route_order: index + 1,
    }));

    await Promise.all(
      orderUpdates.map((update) =>
        supabase
          .from("jobs")
          .update({ route_order: update.route_order })
          .eq("id", update.id)
      )
    );

    return {
      data: {
        optimizedJobs,
        totalDistanceMiles: optimizedMetrics.totalDistanceMiles,
        estimatedMinutes: optimizedMetrics.estimatedMinutes,
        savings: {
          distanceSaved: Math.max(
            0,
            originalMetrics.totalDistanceMiles - optimizedMetrics.totalDistanceMiles
          ),
          timeSaved: Math.max(
            0,
            originalMetrics.estimatedMinutes - optimizedMetrics.estimatedMinutes
          ),
        },
      },
    };
  } catch (err) {
    const error = err as Error;
    return { error: error.message ?? "Route optimization failed" };
  }
}

export async function getRouteForDate(
  userId: string,
  technicianId: string,
  date: string
) {
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .eq("technician_id", technicianId)
    .gte("scheduled_date", dateStart.toISOString())
    .lte("scheduled_date", dateEnd.toISOString())
    .order("route_order", { ascending: true, nullsFirst: false });

  return { data: (data as Job[]) ?? [], error: error?.message };
}
