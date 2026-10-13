import { IViewRecord } from '../models/Submission';
import { env } from '../config/env';

export function detectSpike(viewHistory: IViewRecord[]): boolean {
  if (!viewHistory || viewHistory.length < 2) return false;

  const latest = viewHistory[viewHistory.length - 1];
  const previous = viewHistory[viewHistory.length - 2];

  const deltaViews = latest.views - previous.views;
  if (deltaViews <= 0) return false;

  const timeDeltaMs = new Date(latest.recordedAt).getTime() - new Date(previous.recordedAt).getTime();
  const timeDeltaHours = timeDeltaMs / (1000 * 60 * 60);

  // If time delta is 0 or negative, avoid division by zero
  if (timeDeltaHours <= 0) return false;

  const viewsPerHour = deltaViews / timeDeltaHours;
  const growthRate = deltaViews / (previous.views || 1);

  const rateThreshold = parseFloat(env.SPIKE_RATE_THRESHOLD);
  const viewsPerHourThreshold = parseFloat(env.SPIKE_VIEWS_PER_HOUR_THRESHOLD);

  if (growthRate > rateThreshold || viewsPerHour > viewsPerHourThreshold) {
    return true;
  }

  return false;
}
