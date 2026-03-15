import { ScoringConfig, getScoringConfig } from './scoringConfig';

export function computeScoritoPoints({
  category,
  qualPosition,
  racePosition,
  dnf,
  slotMultiplier,
  applyMultiplierTo,
}: {
  category: string;
  qualPosition: number | null;
  racePosition: number | null;
  dnf: boolean;
  slotMultiplier: number;
  applyMultiplierTo?: 'race' | 'total';
}): { qual: number; race: number; total: number } {
  const config = getScoringConfig();
  const cat = category.toUpperCase();
  const qualPoints =
    !qualPosition || dnf
      ? config.qualifying_points.DNF
      : config.qualifying_points[cat]?.[qualPosition - 1] ?? 0;
  const racePoints =
    !racePosition || dnf
      ? config.race_points.DNF
      : config.race_points[cat]?.[racePosition - 1] ?? 0;
  const mult = slotMultiplier;
  const mode = applyMultiplierTo || config.apply_multiplier_to;
  const total =
    mode === 'race'
      ? qualPoints + racePoints * mult
      : (qualPoints + racePoints) * mult;
  return { qual: qualPoints, race: racePoints, total };
}
