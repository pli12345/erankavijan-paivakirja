import * as Location from 'expo-location';

export type Coords = { latitude: number; longitude: number };

export async function getCurrentCoords(): Promise<Coords | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
}

export function formatCoords({ latitude, longitude }: Coords): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
