import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
export const unstable_settings = {
  anchor: '(tabs)',
};
const queryClient = new QueryClient()
export default function RootLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="search" options={{ headerShown: false }} />
            <Stack.Screen name="room-detail/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="room-photos/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="filter" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="auth/onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
            <Stack.Screen name="auth/verify-otp" options={{ headerShown: false }} />
            <Stack.Screen name="auth/set-password" options={{ headerShown: false }} />
            <Stack.Screen name="profile/edit-profile" options={{ headerShown: false }} />
            <Stack.Screen name="booking/select-date" options={{ headerShown: false }} />
            <Stack.Screen name="booking/select-guest" options={{ headerShown: false }} />
            <Stack.Screen name="booking/confirm-pay" options={{ headerShown: false }} />
            <Stack.Screen name="booking/add-card" options={{ headerShown: false }} />
            <Stack.Screen name="booking/payment-done" options={{ headerShown: false }} />
            <Stack.Screen name="booking/write-review" options={{ headerShown: false }} />
            <Stack.Screen name="booking/booking-detail" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
