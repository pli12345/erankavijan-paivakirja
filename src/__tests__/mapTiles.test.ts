import { attributionText, getLayer, MAP_LAYERS, tileUrlTemplate } from '../mapTiles';

describe('tileUrlTemplate', () => {
  it('puts the path segments in WMTS order z/y/x, not z/x/y', () => {
    // This is the bug the spike script guards against: the wrong order still
    // returns HTTP 200 but shows a different part of Finland.
    const url = tileUrlTemplate('maastokartta');
    expect(url).toContain('/{z}/{y}/{x}.');
    expect(url).not.toContain('/{z}/{x}/{y}.');
  });

  it('uses the Web Mercator tile matrix set the map component renders in', () => {
    expect(tileUrlTemplate('maastokartta')).toContain('/WGS84_Pseudo-Mercator/');
  });

  it('points at the open service', () => {
    expect(tileUrlTemplate('taustakartta')).toContain(
      'https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts/1.0.0/'
    );
  });

  it('requests each layer by its own name', () => {
    for (const layer of MAP_LAYERS) {
      expect(tileUrlTemplate(layer.id)).toContain(`/1.0.0/${layer.id}/default/`);
    }
  });

  it('asks for jpeg for the orthophoto and png for the maps', () => {
    expect(tileUrlTemplate('ortokuva')).toContain('.jpg?');
    expect(tileUrlTemplate('maastokartta')).toContain('.png?');
    expect(tileUrlTemplate('taustakartta')).toContain('.png?');
  });

  it('passes the key as the api-key query parameter', () => {
    expect(tileUrlTemplate('maastokartta')).toMatch(/\?api-key=/);
  });
});

describe('getLayer', () => {
  it('returns the requested layer', () => {
    expect(getLayer('ortokuva').id).toBe('ortokuva');
  });

  it('falls back to the first layer rather than returning undefined', () => {
    // @ts-expect-error tarkoituksellisesti väärä arvo, jollainen voi tulla
    // vanhasta tallennetusta asetuksesta.
    expect(getLayer('peruskartta').id).toBe(MAP_LAYERS[0].id);
  });
});

describe('attributionText', () => {
  // CC BY 4.0 requires the licensor, the dataset name and the date. These
  // assertions exist so the licence text cannot be quietly trimmed away.
  it('names the licensor', () => {
    expect(attributionText('maastokartta')).toContain('Maanmittauslaitoksen');
  });

  it('names the dataset', () => {
    expect(attributionText('maastokartta')).toContain('Maastokartta');
    expect(attributionText('ortokuva')).toContain('Ortokuva');
  });

  it('includes the month and year the tiles were fetched', () => {
    expect(attributionText('maastokartta', new Date(2026, 8, 11))).toContain('09/2026');
  });

  it('pads single-digit months', () => {
    expect(attributionText('taustakartta', new Date(2026, 0, 5))).toContain('01/2026');
  });
});
