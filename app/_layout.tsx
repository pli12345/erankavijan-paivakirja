import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/auth';
import { useTheme } from '../src/useTheme';

function RootNavigator() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const t = useTheme();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) router.replace('/(auth)/login');
    else if (session && inAuthGroup) router.replace('/(tabs)');
  }, [session, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <ActivityIndicator color={t.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="trip/new"
        options={{ presentation: 'modal', headerShown: true, title: 'Uusi reissu' }}
      />
      <Stack.Screen name="trip/[id]" options={{ headerShown: true, title: 'Reissu' }} />
      <Stack.Screen
        name="catch/new"
        options={{ presentation: 'modal', headerShown: true, title: 'Uusi saalis' }}
      />
      <Stack.Screen name="catch/[id]" options={{ headerShown: true, title: 'Saalis' }} />
      <Stack.Screen
        name="observation/new"
        options={{ presentation: 'modal', headerShown: true, title: 'Uusi havainto' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
