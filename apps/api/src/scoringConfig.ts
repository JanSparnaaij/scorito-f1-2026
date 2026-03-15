import fs from 'fs';
import path from 'path';

export type ScoringConfig = {
  version: number;
  apply_multiplier_to: 'race' | 'total';
  qualifying_points: Record<string, number[]> & { DNF: number };
  race_points: Record<string, number[]> & { DNF: number };
  selection_slots: Record<string, number>;
};

let cached: ScoringConfig | null = null;

export function getScoringConfig(): ScoringConfig {
  if (cached) return cached;
  const file = path.join(__dirname, '../../config/scoring.json');
  cached = JSON.parse(fs.readFileSync(file, 'utf-8'));
  return cached;
}
