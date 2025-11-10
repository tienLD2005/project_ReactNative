import { BookingResponse, getBookingById } from '@/apis/bookingApi';
import { BOOKING_COLORS } from '@/constants/booking';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingDetailScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const bookingId = parseInt(params.bookingId as string) || 0;

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadBookingDetail();
  }, [bookingId]);

  const loadBookingDetail = async () => {
    try {
      setLoading(true);
      const data = await getBookingById(bookingId);
      setBooking(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tải thông tin booking');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateInput: string | number[] | null | undefined): string => {
    if (!dateInput) {
      return 'N/A';
    }

    try {
      let date: Date;

      // Handle array format [year, month, day] from backend
      if (Array.isArray(dateInput)) {
        const [year, month, day] = dateInput;
        if (year && month !== undefined && day !== undefined) {
          date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
        } else {
          console.error('Invalid date array:', dateInput);
          return 'N/A';
        }
      } else {
        // Handle string format
        const dateString = String(dateInput);

        if (dateString.includes('T')) {
          // ISO format with time: "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DDTHH:mm:ss.SSSZ"
          date = new Date(dateString);
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          // Format "YYYY-MM-DD" - parse manually to avoid timezone issues
          const [year, month, day] = dateString.split('-').map(Number);
          date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
        } else {
          // Try to parse as-is
          date = new Date(dateString);
        }
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateInput);
        return 'N/A';
      }

      // Format date to readable string
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateInput);
      return 'N/A';
    }
  };

  if (loading || !booking) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />
        <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Booking Image */}
        <ExpoImage
          source={{
            uri: booking.roomImageUrl || 'https://via.placeholder.com/400x200?text=No+Image',
          }}
          style={styles.bookingImage}
          contentFit="cover"
        />

        {/* Booking Info */}
        <View style={styles.content}>
          {/* Rating - hiển thị kể cả khi bằng 0 */}
          <View style={styles.ratingRow}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(booking.rating || 0) ? 'star' : 'star-outline'}
                size={16}
                color={BOOKING_COLORS.RATING}
              />
            ))}
            <Text style={styles.ratingText}>
              {(booking.rating || 0).toFixed(1)} ({(booking.reviewCount || 0)} {(booking.reviewCount || 0) === 1 ? 'Review' : 'Reviews'})
            </Text>
          </View>

          {/* Room Type */}
          {booking.roomType ? (
            <Text style={styles.roomType}>{booking.roomType}</Text>
          ) : null}

          {/* Hotel Name */}
          <Text style={styles.hotelName}>{booking.hotelName || 'Hotel'}</Text>

          {/* Location */}
          {(booking.hotelLocation || booking.hotelCity) && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={18} color={BOOKING_COLORS.TEXT_SECONDARY} />
              <Text style={styles.location}>
                {booking.hotelLocation || booking.hotelCity || booking.hotelAddress || ''}
              </Text>
            </View>
          )}

          {/* Booking Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Booking Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking ID</Text>
              <Text style={styles.detailValue}>{booking.bookingId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-in</Text>
              <Text style={styles.detailValue}>{formatDate(booking.checkIn)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-out</Text>
              <Text style={styles.detailValue}>{formatDate(booking.checkOut)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Guests</Text>
              <Text style={styles.detailValue}>
                {booking.adultsCount} {booking.adultsCount === 1 ? 'adult' : 'adults'}
                {booking.childrenCount > 0 && `, ${booking.childrenCount} ${booking.childrenCount === 1 ? 'child' : 'children'}`}
                {booking.infantsCount > 0 && `, ${booking.infantsCount} ${booking.infantsCount === 1 ? 'infant' : 'infants'}`}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text
                style={[
                  styles.detailValue,
                  booking.status === 'CONFIRMED' && styles.statusConfirmed,
                  booking.status === 'CANCELLED' && styles.statusCancelled,
                  booking.status === 'PENDING' && styles.statusPending,
                ]}>
                {booking.status === 'CONFIRMED'
                  ? 'Confirmed'
                  : booking.status === 'CANCELLED'
                    ? 'Cancelled'
                    : 'Pending'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Price</Text>
              <Text style={[styles.detailValue, styles.priceValue]}>
                ${booking.totalPrice.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bookingImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  roomType: {
    fontSize: 20,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  location: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  detailsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  detailLabel: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  statusConfirmed: {
    color: '#10B981',
    fontWeight: '600',
  },
  statusCancelled: {
    color: '#EF4444',
    fontWeight: '600',
  },
  statusPending: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.PRIMARY,
  },
});

