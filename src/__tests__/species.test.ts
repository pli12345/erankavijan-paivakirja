import { hasAntlers, SPECIES, SPECIES_GROUPS, speciesIcon } from '../species';

describe('species list', () => {
  it('has no duplicate names', () => {
    const names = SPECIES.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('only uses groups that the picker renders', () => {
    // A species in a group missing from SPECIES_GROUPS would be invisible in
    // the UI without any error.
    for (const s of SPECIES) {
      expect(SPECIES_GROUPS).toContain(s.group);
    }
  });

  it('gives every group at least one species', () => {
    for (const g of SPECIES_GROUPS) {
      expect(SPECIES.some((s) => s.group === g)).toBe(true);
    }
  });

  it('gives every species a non-empty icon', () => {
    for (const s of SPECIES) {
      expect(s.icon.length).toBeGreaterThan(0);
    }
  });
});

describe('speciesIcon', () => {
  it('returns the icon of a known species', () => {
    expect(speciesIcon('Hirvi')).toBe('🫎');
  });

  it('falls back for an unknown name instead of returning undefined', () => {
    expect(speciesIcon('Yksisarvinen')).toBe('🎯');
  });

  it('falls back for an empty name', () => {
    expect(speciesIcon('')).toBe('🎯');
  });

  // Stored rows keep the species name as written at save time, so a renamed
  // entry must still resolve rather than crash the detail screen.
  it('is case sensitive and falls back rather than throwing', () => {
    expect(() => speciesIcon('hirvi')).not.toThrow();
    expect(speciesIcon('hirvi')).toBe('🎯');
  });
});

describe('hasAntlers', () => {
  it('is true for deer species', () => {
    expect(hasAntlers('Hirvi')).toBe(true);
    expect(hasAntlers('Valkohäntäpeura')).toBe(true);
    expect(hasAntlers('Metsäkauris')).toBe(true);
  });

  it('is false for birds and small game', () => {
    expect(hasAntlers('Teeri')).toBe(false);
    expect(hasAntlers('Kettu')).toBe(false);
    expect(hasAntlers('Sinisorsa')).toBe(false);
  });

  it('is false for wild boar, which is not in the deer group', () => {
    expect(hasAntlers('Villisika')).toBe(false);
  });

  it('is false for an unknown species', () => {
    expect(hasAntlers('Yksisarvinen')).toBe(false);
  });
});
