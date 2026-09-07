import MapView, { Marker, PROVIDER_DEFAULT, type Region } from 'react-native-maps';
import { StyleSheet } from 'react-native';

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
}: {
  markers: MapMarker[];
  initialRegion: Region;
  onPressMarker: (id: string) => void;
}) {
  return (
    <MapView provider={PROVIDER_DEFAULT} style={StyleSheet.absoluteFill} initialRegion={initialRegion}>
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
  );
}
