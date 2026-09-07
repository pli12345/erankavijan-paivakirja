export type SpeciesGroup = 'Hirvieläimet' | 'Suurpedot' | 'Pienriista' | 'Vesilinnut' | 'Kanalinnut' | 'Muut';

export type Species = {
  name: string;
  group: SpeciesGroup;
  icon: string;
};

export const SPECIES: Species[] = [
  { name: 'Hirvi', group: 'Hirvieläimet', icon: '🫎' },
  { name: 'Valkohäntäpeura', group: 'Hirvieläimet', icon: '🦌' },
  { name: 'Metsäkauris', group: 'Hirvieläimet', icon: '🦌' },
  { name: 'Kuusipeura', group: 'Hirvieläimet', icon: '🦌' },
  { name: 'Metsäpeura', group: 'Hirvieläimet', icon: '🦌' },
  { name: 'Villisika', group: 'Muut', icon: '🐗' },

  { name: 'Karhu', group: 'Suurpedot', icon: '🐻' },
  { name: 'Susi', group: 'Suurpedot', icon: '🐺' },
  { name: 'Ilves', group: 'Suurpedot', icon: '🐈' },

  { name: 'Metsäjänis', group: 'Pienriista', icon: '🐇' },
  { name: 'Rusakko', group: 'Pienriista', icon: '🐇' },
  { name: 'Kettu', group: 'Pienriista', icon: '🦊' },
  { name: 'Supikoira', group: 'Pienriista', icon: '🦝' },
  { name: 'Mäyrä', group: 'Pienriista', icon: '🦡' },
  { name: 'Orava', group: 'Pienriista', icon: '🐿️' },
  { name: 'Minkki', group: 'Pienriista', icon: '🦦' },
  { name: 'Näätä', group: 'Pienriista', icon: '🦦' },
  { name: 'Majava', group: 'Pienriista', icon: '🦫' },
  { name: 'Piisami', group: 'Pienriista', icon: '🐀' },

  { name: 'Metso', group: 'Kanalinnut', icon: '🦃' },
  { name: 'Teeri', group: 'Kanalinnut', icon: '🐦' },
  { name: 'Pyy', group: 'Kanalinnut', icon: '🐦' },
  { name: 'Riekko', group: 'Kanalinnut', icon: '🐦' },
  { name: 'Fasaani', group: 'Kanalinnut', icon: '🐓' },
  { name: 'Peltopyy', group: 'Kanalinnut', icon: '🐦' },

  { name: 'Sinisorsa', group: 'Vesilinnut', icon: '🦆' },
  { name: 'Tavi', group: 'Vesilinnut', icon: '🦆' },
  { name: 'Telkkä', group: 'Vesilinnut', icon: '🦆' },
  { name: 'Haapana', group: 'Vesilinnut', icon: '🦆' },
  { name: 'Jouhisorsa', group: 'Vesilinnut', icon: '🦆' },
  { name: 'Heinätavi', group: 'Vesilinnut', icon: '🦆' },
  { name: 'Nokikana', group: 'Vesilinnut', icon: '🦆' },
  { name: 'Metsähanhi', group: 'Vesilinnut', icon: '🦢' },
  { name: 'Merihanhi', group: 'Vesilinnut', icon: '🦢' },
  { name: 'Kanadanhanhi', group: 'Vesilinnut', icon: '🦢' },

  { name: 'Sepelkyyhky', group: 'Muut', icon: '🕊️' },
  { name: 'Lehtokurppa', group: 'Muut', icon: '🐦' },
  { name: 'Varis', group: 'Muut', icon: '🐦‍⬛' },
  { name: 'Harakka', group: 'Muut', icon: '🐦‍⬛' },
  { name: 'Muu', group: 'Muut', icon: '🎯' },
];

export const SPECIES_GROUPS: SpeciesGroup[] = [
  'Hirvieläimet',
  'Kanalinnut',
  'Vesilinnut',
  'Pienriista',
  'Suurpedot',
  'Muut',
];

const byName = new Map(SPECIES.map((s) => [s.name, s]));

export function speciesIcon(name: string): string {
  return byName.get(name)?.icon ?? '🎯';
}

/** Antler points are only meaningful for deer species. */
export function hasAntlers(name: string): boolean {
  return byName.get(name)?.group === 'Hirvieläimet';
}
