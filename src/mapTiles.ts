/**
 * Maanmittauslaitoksen avoin karttakuvapalvelu (WMTS).
 *
 * Tekninen kuvaus:
 *   https://www.maanmittauslaitos.fi/en/maps-and-spatial-data/datasets-and-interfaces/map-interface-services/map-image-service-wms-wmts-1
 * API-avaimen ohje ja rekisteröinti:
 *   https://omatili.maanmittauslaitos.fi/user/new/avoimet-rajapintapalvelut
 *
 * Lisenssi: Creative Commons Attribution 4.0 International (CC BY 4.0).
 * Lisenssi vaatii, että mainitaan lisenssinantaja, aineiston nimi ja
 * ajankohta jona aineisto on toimitettu. Attribuutio EI saa kadota
 * muutosten yhteydessä — se on lisenssiehto, ei tyylikysymys.
 */

const BASE = 'https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts/1.0.0';

/**
 * WMTS REST -polun järjestys on {TileMatrix}/{TileRow}/{TileCol}, eli z/y/x.
 * react-native-mapsin UrlTile korvaa paikanvaraajat samassa järjestyksessä,
 * joten template menee suoraan. Huom: y ennen x, ei toisin päin.
 */
const TILE_MATRIX_SET = 'WGS84_Pseudo-Mercator';

export type MapLayerId = 'maastokartta' | 'taustakartta' | 'ortokuva';

export type MapLayer = {
  id: MapLayerId;
  label: string;
  /** Aineiston nimi sellaisena kuin se attribuutiossa mainitaan. */
  datasetName: string;
  format: 'png' | 'jpg';
  maximumZ: number;
};

export const MAP_LAYERS: MapLayer[] = [
  {
    id: 'maastokartta',
    label: 'Maastokartta',
    datasetName: 'Maastokartta',
    format: 'png',
    maximumZ: 18,
  },
  {
    id: 'taustakartta',
    label: 'Taustakartta',
    datasetName: 'Taustakartta',
    format: 'png',
    maximumZ: 18,
  },
  {
    id: 'ortokuva',
    label: 'Ilmakuva',
    datasetName: 'Ortokuva',
    format: 'jpg',
    maximumZ: 18,
  },
];

export const DEFAULT_LAYER: MapLayerId = 'maastokartta';

const apiKey = process.env.EXPO_PUBLIC_MML_API_KEY ?? '';

/** Onko karttapalvelu käytettävissä. Ilman avainta laatat palauttavat 401. */
export function hasMapKey(): boolean {
  return apiKey.trim().length > 0;
}

export function getLayer(id: MapLayerId): MapLayer {
  return MAP_LAYERS.find((l) => l.id === id) ?? MAP_LAYERS[0];
}

/**
 * UrlTile-template. Avain menee kyselyparametrina, koska react-native-mapsin
 * UrlTile ei tue omia otsakkeita — Basic-autentikaatio ei siis ole vaihtoehto.
 */
export function tileUrlTemplate(id: MapLayerId): string {
  const layer = getLayer(id);
  return `${BASE}/${layer.id}/default/${TILE_MATRIX_SET}/{z}/{y}/{x}.${layer.format}?api-key=${apiKey}`;
}

/**
 * CC BY 4.0 edellyttää lisenssinantajan, aineiston nimen ja ajankohdan
 * mainitsemista. Ajankohta on kuukausi jona laatat on haettu.
 */
export function attributionText(id: MapLayerId, now: Date = new Date()): string {
  const layer = getLayer(id);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `Sisältää Maanmittauslaitoksen ${layer.datasetName}-aineistoa ${month}/${now.getFullYear()}`;
}
