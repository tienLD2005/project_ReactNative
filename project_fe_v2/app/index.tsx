import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

const SPLASH_DURATION = 2000;

export default function SplashScreen(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const navigateToOnboarding = (): void => {
      setTimeout(() => {
        if (!isMounted) return;
        router.replace('/onboarding');
      }, SPLASH_DURATION);
    };

    // Đợi một chút để đảm bảo component đã mount hoàn toàn
    const timer = setTimeout(() => {
      navigateToOnboarding();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={Platform.OS === 'android'}
      />
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 400,
    height: 160,
  },
});