import { computeScoritoPoints } from '../../apps/api/src/scorer';

describe('Scorito scorer', () => {
  it('A@Q11=20', () => {
    const res = computeScoritoPoints({
      category: 'A',
      qualPosition: 11,
      racePosition: 1,
      dnf: false,
      slotMultiplier: 8,
    });
    expect(res.qual).toBe(20);
  });
  it('C@R10=80', () => {
    const res = computeScoritoPoints({
      category: 'C',
      qualPosition: 1,
      racePosition: 10,
      dnf: false,
      slotMultiplier: 1,
    });
    expect(res.race).toBe(80);
  });
  it('DNF→0', () => {
    const res = computeScoritoPoints({
      category: 'A',
      qualPosition: 1,
      racePosition: 1,
      dnf: true,
      slotMultiplier: 8,
    });
    expect(res.qual).toBe(0);
    expect(res.race).toBe(0);
  });
  it('multiplier default on race', () => {
    const res = computeScoritoPoints({
      category: 'A',
      qualPosition: 1,
      racePosition: 1,
      dnf: false,
      slotMultiplier: 8,
    });
    expect(res.total).toBe(240 + 120 * 8);
  });
  it('switch mode to total', () => {
    const res = computeScoritoPoints({
      category: 'A',
      qualPosition: 1,
      racePosition: 1,
      dnf: false,
      slotMultiplier: 8,
      applyMultiplierTo: 'total',
    });
    expect(res.total).toBe((240 + 120) * 8);
  });
});
