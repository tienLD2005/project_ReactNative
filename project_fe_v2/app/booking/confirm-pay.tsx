import { getRoomById, RoomResponse } from '@/apis/roomApi';
import { BOOKING_COLORS } from '@/constants/booking';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ConfirmPayScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const adults = parseInt(params.adults as string) || 2;
  const children = parseInt(params.children as string) || 0;
  const infants = parseInt(params.infants as string) || 0;

  // Get room price from params or room data
  const roomPrice = room?.price || parseFloat(params.roomPrice as string) || 0;

  // Fetch room data
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        setLoading(true);
        const roomId = parseInt(params.roomId as string);
        if (roomId) {
          const roomData = await getRoomById(roomId);
          setRoom(roomData);
        }
      } catch (error) {
        console.error('Error loading room data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoomData();
  }, [params.roomId]);

  // Helper function to parse date from various formats
  const parseDate = (dateInput: string | number[] | null | undefined): Date | null => {
    if (!dateInput) return null;

    try {
      // Handle array format [year, month, day] from backend
      if (Array.isArray(dateInput)) {
        const [year, month, day] = dateInput;
        if (year && month !== undefined && day !== undefined) {
          return new Date(year, month - 1, day); // month is 0-indexed in JS Date
        }
        return null;
      }

      // Handle string format
      const dateString = String(dateInput);

      if (dateString.includes('T')) {
        // ISO format with time
        return new Date(dateString);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // Format "YYYY-MM-DD" - parse manually to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
      } else {
        // Try to parse as-is
        return new Date(dateString);
      }
    } catch (error) {
      console.error('Error parsing date:', error, dateInput);
      return null;
    }
  };

  // Calculate number of nights from checkIn and checkOut
  const checkIn = parseDate(params.checkIn as string | number[] | undefined);
  const checkOut = parseDate(params.checkOut as string | number[] | undefined);
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  // Format dates for display
  const formatDateDisplay = (date: Date | null): string => {
    if (!date || isNaN(date.getTime())) return 'Not selected';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const datesDisplay = checkIn && checkOut
    ? `${formatDateDisplay(checkIn)} - ${formatDateDisplay(checkOut)}`
    : 'Please select dates';

  // Calculate total price: room price * number of guests * number of nights
  const totalGuests = adults + children; // infants don't count
  const subtotal = roomPrice * nights;
  const discount = 0; // No discount for now
  const taxes = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal - discount + taxes;

  const handlePayNow = () => {
    // Validate dates are present
    if (!checkIn || !checkOut) {
      // Show error or navigate back to select dates
      return;
    }

    // Pass all booking params to add card screen
    router.push({
      pathname: '/booking/add-card',
      params: {
        ...params,
        roomId: params.roomId || '',
        checkIn: params.checkIn as string,
        checkOut: params.checkOut as string,
        totalPrice: Math.round(total).toString(),
      },
    });
  };

  const renderRadioOption = (
    label: string,
    subtitle: string,
    value: 'full' | 'partial',
    selected: boolean,
  ) => {
    return (
      <TouchableOpacity
        style={styles.radioOption}
        onPress={() => setPaymentType(value)}>
        <View style={styles.radioButtonContainer}>
          <View style={[styles.radioButton, selected && styles.radioButtonSelected]}>
            {selected && <View style={styles.radioButtonInner} />}
          </View>
        </View>
        <View style={styles.radioTextContainer}>
          <Text style={styles.radioLabel}>{label}</Text>
          <Text style={styles.radioSubtitle}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm & Pay</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>

        {/* Property Details Card */}
        {loading ? (
          <View style={styles.propertyCard}>
            <ActivityIndicator size="small" color={BOOKING_COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading room details...</Text>
          </View>
        ) : room ? (
          <View style={styles.propertyCard}>
            <ExpoImage
              source={{
                uri:
                  room.imageUrls && room.imageUrls.length > 0
                    ? room.imageUrls[0]
                    : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=200',
              }}
              style={styles.propertyImage}
              contentFit="cover"
            />
            <View style={styles.propertyInfo}>
              {room.rating && room.rating > 0 && (
                <View style={styles.ratingRow}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < Math.floor(room.rating || 0) ? 'star' : 'star-outline'}
                      size={14}
                      color={BOOKING_COLORS.RATING}
                    />
                  ))}
                  <Text style={styles.ratingText}>
                    {room.rating.toFixed(1)} ({room.reviewCount || 0} Reviews)
                  </Text>
                </View>
              )}
              <Text style={styles.propertyName}>{room.roomType}</Text>
              <Text style={styles.propertyLocation}>{room.hotelName || 'Hotel'}</Text>
              <Text style={styles.propertySummary}>
                {adults} {adults === 1 ? 'adult' : 'adults'}
                {children > 0 && ` | ${children} ${children === 1 ? 'child' : 'children'}`}
                {infants > 0 && ` | ${infants} ${infants === 1 ? 'infant' : 'infants'}`}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.propertyCard}>
            <ExpoImage
              source={{
                uri:
                  (params.roomImage as string) ||
                  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=200',
              }}
              style={styles.propertyImage}
              contentFit="cover"
            />
            <View style={styles.propertyInfo}>
              {params.rating && parseFloat(params.rating as string) > 0 && (
                <View style={styles.ratingRow}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={
                        i < Math.floor(parseFloat(params.rating as string) || 0)
                          ? 'star'
                          : 'star-outline'
                      }
                      size={14}
                      color={BOOKING_COLORS.RATING}
                    />
                  ))}
                  <Text style={styles.ratingText}>
                    {parseFloat(params.rating as string).toFixed(1)} (
                    {params.reviewCount || 0} Reviews)
                  </Text>
                </View>
              )}
              <Text style={styles.propertyName}>
                {params.roomName || 'Room'}
              </Text>
              <Text style={styles.propertyLocation}>
                {params.hotelName || 'Hotel'}
              </Text>
              <Text style={styles.propertySummary}>
                {adults} {adults === 1 ? 'adult' : 'adults'}
                {children > 0 && ` | ${children} ${children === 1 ? 'child' : 'children'}`}
                {infants > 0 && ` | ${infants} ${infants === 1 ? 'infant' : 'infants'}`}
              </Text>
            </View>
          </View>
        )}

        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Booking Details</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Dates</Text>
              <Text style={styles.detailValue}>{datesDisplay}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                // Navigate back to select-date to change dates
                router.push({
                  pathname: '/booking/select-date',
                  params: {
                    roomId: params.roomId,
                    roomName: params.roomName,
                    roomPrice: params.roomPrice,
                    adults: params.adults,
                    children: params.children,
                    infants: params.infants,
                    checkIn: params.checkIn,
                    checkOut: params.checkOut,
                  },
                });
              }}>
              <Ionicons name="pencil" size={20} color={BOOKING_COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Guests</Text>
              <Text style={styles.detailValue}>
                {adults} {adults === 1 ? 'adult' : 'adults'}
                {children > 0 && ` | ${children} ${children === 1 ? 'child' : 'children'}`}
                {infants > 0 && ` | ${infants} ${infants === 1 ? 'infant' : 'infants'}`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                // Navigate back to select-guest to change guests
                router.push({
                  pathname: '/booking/select-guest',
                  params: {
                    roomId: params.roomId,
                    roomName: params.roomName,
                    roomPrice: params.roomPrice,
                    checkIn: params.checkIn,
                    checkOut: params.checkOut,
                    adults: params.adults,
                    children: params.children,
                    infants: params.infants,
                  },
                });
              }}>
              <Ionicons name="pencil" size={20} color={BOOKING_COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose how to pay</Text>
          {renderRadioOption(
            'Pay in full',
            'Pay the total now and you\'re all set.',
            'full',
            paymentType === 'full',
          )}
          {renderRadioOption(
            'Pay part now, part later',
            'Pay part now and you\'re all set.',
            'partial',
            paymentType === 'partial',
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pay with</Text>
          <View style={styles.paymentMethodRow}>
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.detailLabel}>Payment method</Text>
              <View style={styles.paymentIcons}>
                <Ionicons name="card-outline" size={24} color={BOOKING_COLORS.TEXT_SECONDARY} />
                <Ionicons name="wallet-outline" size={24} color={BOOKING_COLORS.TEXT_SECONDARY} />
                <Ionicons name="logo-google" size={24} color={BOOKING_COLORS.TEXT_SECONDARY} />
              </View>
            </View>
            <TouchableOpacity>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>${Math.round(roomPrice)}  x {nights} nights</Text>
            <Text style={styles.priceValue}>${Math.round(subtotal)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={[styles.priceValue, styles.discountValue]}>-${Math.round(discount)}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Occupancy taxes and fees</Text>
            <Text style={styles.priceValue}>${Math.round(taxes)}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>${Math.round(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pay Now Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
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
    padding: 16,
    paddingBottom: 100,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  propertyInfo: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  propertySummary: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioButtonContainer: {
    marginRight: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BOOKING_COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: BOOKING_COLORS.PRIMARY,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BOOKING_COLORS.PRIMARY,
  },
  radioTextContainer: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  radioSubtitle: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentIcons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  discountValue: {
    color: '#10B981',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BOOKING_COLORS.BORDER,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: BOOKING_COLORS.BORDER,
  },
  payButton: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
});

