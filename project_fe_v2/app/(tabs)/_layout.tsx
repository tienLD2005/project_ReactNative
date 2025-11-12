import { getUnreadCount } from '@/apis/notificationApi';
import { BOOKING_COLORS } from '@/constants/booking';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, Text, View } from 'react-native';

// Component để hiển thị icon với badge
function NotificationIconWithBadge({
  color,
  size,
  refreshTrigger
}: {
  color: string;
  size: number;
  refreshTrigger?: number;
}) {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const loadUnreadCount = async () => {
    try {
      // Check if user is logged in before making request
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setUnreadCount(0);
        return;
      }

      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error: any) {
      // Only log if it's not a network error (which is expected when backend is down)
      if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
        console.error('Error loading unread count:', error);
      }
      // Set to 0 on error to avoid showing stale data
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadUnreadCount();

    // Refetch mỗi 5 giây để cập nhật badge (cân bằng giữa UX và tải backend)
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 5000);

    // Refetch khi app được focus (khi quay lại app)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        loadUnreadCount();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  // Refetch khi có trigger từ parent (khi tab được focus hoặc có thay đổi)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadUnreadCount();
    }
  }, [refreshTrigger]);

  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <Ionicons name="notifications-outline" size={size} color={color} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout(): React.JSX.Element {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Refetch badge khi app được focus
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Trigger refresh badge khi app được focus
        setRefreshTrigger((prev) => prev + 1);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BOOKING_COLORS.PRIMARY,
        tabBarInactiveTintColor: BOOKING_COLORS.TEXT_SECONDARY,
        tabBarStyle: {
          backgroundColor: BOOKING_COLORS.BACKGROUND,
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          marginBottom: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <NotificationIconWithBadge
              color={color}
              size={size}
              refreshTrigger={refreshTrigger}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: BOOKING_COLORS.BACKGROUND,
  },
  badgeText: {
    color: BOOKING_COLORS.BACKGROUND,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});