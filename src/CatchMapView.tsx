import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile, type Region } from 'react-native-maps';
import {
  attributionText,
  getLayer,
  hasMapKey,
  tileUrlTemplate,
  type MapLayerId,
} from './mapTiles';
import { radius, spacing } from './theme';

export type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
  color: string;
};

export function CatchMapView({
  markers,
  initialRegion,
  onPressMarker,
  layerId,
}: {
  markers: MapMarker[];
  initialRegion: Region;
  onPressMarker: (id: string) => void;
  layerId: MapLayerId;
}) {
  const layer = getLayer(layerId);
  const useMml = hasMapKey();

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        // Androidilla 'none' piilottaa Googlen peruskartan, iOS:llä sen tekee
        // UrlTilen shouldReplaceMapContent. Ilman avainta näytetään alustan
        // oma peruskartta, jotta kartta ei jää mustaksi ruuduksi.
        mapType={useMml && Platform.OS === 'android' ? 'none' : 'standard'}>
        {useMml && (
          <UrlTile
            urlTemplate={tileUrlTemplate(layerId)}
            maximumZ={layer.maximumZ}
            minimumZ={0}
            shouldReplaceMapContent
            tileSize={256}
            zIndex={-1}
          />
        )}
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.title}
            description={m.subtitle}
            pinColor={m.color}
            onCalloutPress={() => onPressMarker(m.id)}
          />
        ))}
      </MapView>

      {/*
        CC BY 4.0 -lisenssin vaatima attribuutio. Tämä on lisenssiehto:
        älä poista äläkä piilota, vaikka se veisi tilaa kartalta.
      */}
      {useMml && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: spacing.sm,
            bottom: spacing.sm,
            backgroundColor: 'rgba(0,0,0,0.55)',
            paddingHorizontal: spacing.sm,
            paddingVertical: 4,
            borderRadius: radius.sm,
          }}>
          <Text style={{ color: '#fff', fontSize: 10 }}>{attributionText(layerId)}</Text>
        </View>
      )}
    </View>
  );
}
