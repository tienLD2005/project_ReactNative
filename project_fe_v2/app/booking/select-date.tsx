import { BOOKING_COLORS } from '@/constants/booking';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DateSelection {
  checkIn: Date | null;
  checkOut: Date | null;
}

export default function SelectDateScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Initialize current month from params if dates exist, otherwise use current date
  const initialCheckIn = params.checkIn ? new Date(params.checkIn as string) : null;
  const initialCheckOut = params.checkOut ? new Date(params.checkOut as string) : null;
  const initialMonth = initialCheckIn || new Date();

  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDates, setSelectedDates] = useState<DateSelection>({
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
  });

  // Get first day of month and number of days
  const getFirstDayOfMonth = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  };

  // Get number of days in month
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Check if date is in the past
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if date is selected as check-in
  const isCheckInDate = (date: Date): boolean => {
    if (!selectedDates.checkIn) return false;
    return (
      date.getDate() === selectedDates.checkIn.getDate() &&
      date.getMonth() === selectedDates.checkIn.getMonth() &&
      date.getFullYear() === selectedDates.checkIn.getFullYear()
    );
  };

  // Check if date is selected as check-out
  const isCheckOutDate = (date: Date): boolean => {
    if (!selectedDates.checkOut) return false;
    return (
      date.getDate() === selectedDates.checkOut.getDate() &&
      date.getMonth() === selectedDates.checkOut.getMonth() &&
      date.getFullYear() === selectedDates.checkOut.getFullYear()
    );
  };

  // Check if date is in the selected range
  const isInRange = (date: Date): boolean => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return false;
    // Normalize dates to midnight for comparison
    const dateNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const checkInNormalized = new Date(
      selectedDates.checkIn.getFullYear(),
      selectedDates.checkIn.getMonth(),
      selectedDates.checkIn.getDate()
    );
    const checkOutNormalized = new Date(
      selectedDates.checkOut.getFullYear(),
      selectedDates.checkOut.getMonth(),
      selectedDates.checkOut.getDate()
    );
    return dateNormalized > checkInNormalized && dateNormalized < checkOutNormalized;
  };

  // Handle date selection
  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    selectedDate.setHours(0, 0, 0, 0); // Normalize to midnight

    if (isPastDate(selectedDate)) return;

    // Normalize check-in date for comparison
    const checkInNormalized = selectedDates.checkIn
      ? new Date(
        selectedDates.checkIn.getFullYear(),
        selectedDates.checkIn.getMonth(),
        selectedDates.checkIn.getDate()
      )
      : null;
    checkInNormalized?.setHours(0, 0, 0, 0);

    // If no check-in selected, or both dates are selected, start new selection
    if (!selectedDates.checkIn || (selectedDates.checkIn && selectedDates.checkOut)) {
      // Start new selection
      setSelectedDates({
        checkIn: selectedDate,
        checkOut: null,
      });
    } else if (selectedDates.checkIn && !selectedDates.checkOut) {
      // Selecting check-out
      if (checkInNormalized && selectedDate.getTime() <= checkInNormalized.getTime()) {
        // If selected date is before or equal to check-in, make it the new check-in
        setSelectedDates({
          checkIn: selectedDate,
          checkOut: null,
        });
      } else {
        // Valid check-out date
        setSelectedDates({
          checkIn: selectedDates.checkIn,
          checkOut: selectedDate,
        });
      }
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Render calendar
  const renderCalendar = () => {
    const firstDay = getFirstDayOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.calendarDay} />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isPast = isPastDate(date);
      const isCheckIn = isCheckInDate(date);
      const isCheckOut = isCheckOutDate(date);
      const inRange = isInRange(date);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isCheckIn && styles.checkInDay,
            isCheckOut && styles.checkOutDay,
            inRange && styles.rangeDay,
            isPast && styles.pastDay,
          ]}
          onPress={() => handleDateSelect(day)}
          disabled={isPast}>
          <Text
            style={[
              styles.dayText,
              isCheckIn && styles.selectedDayText,
              isCheckOut && styles.selectedDayText,
              inRange && styles.rangeDayText,
              isPast && styles.pastDayText,
            ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  // Handle next button
  const handleNext = () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      // Show error or alert
      return;
    }

    router.push({
      pathname: '/booking/select-guest',
      params: {
        ...params,
        checkIn: formatDateForAPI(selectedDates.checkIn),
        checkOut: formatDateForAPI(selectedDates.checkOut),
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800' }}
        style={styles.backgroundImage}
        blurRadius={20}>
        <View style={styles.blurOverlay}>
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.BACKGROUND} />
            </TouchableOpacity>
          </View>

          <View style={styles.contentCard}>
            <Text style={styles.title}>Select Date</Text>

            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <Text style={styles.monthText}>
                {formatDate(currentMonth)}
              </Text>
              <View style={styles.monthButtons}>
                <TouchableOpacity
                  style={styles.monthButton}
                  onPress={goToPreviousMonth}>
                  <Ionicons name="chevron-back" size={20} color={BOOKING_COLORS.BACKGROUND} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.monthButton}
                  onPress={goToNextMonth}>
                  <Ionicons name="chevron-forward" size={20} color={BOOKING_COLORS.BACKGROUND} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Calendar */}
            <View style={styles.calendar}>
              {/* Days of week header */}
              <View style={styles.weekHeader}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <Text key={day} style={styles.weekDayText}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar grid */}
              <View style={styles.calendarGrid}>{renderCalendar()}</View>
            </View>

            {/* Selected dates info */}
            {selectedDates.checkIn && (
              <View style={styles.selectedDatesInfo}>
                <Text style={styles.selectedDatesText}>
                  Check-in: {selectedDates.checkIn.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                {selectedDates.checkOut && (
                  <Text style={styles.selectedDatesText}>
                    Check-out: {selectedDates.checkOut.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                )}
              </View>
            )}

            {/* Next Button */}
            <TouchableOpacity
              style={[
                styles.nextButton,
                (!selectedDates.checkIn || !selectedDates.checkOut) && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!selectedDates.checkIn || !selectedDates.checkOut}>
              <Text style={styles.nextButtonText}>Select Guest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(67, 63, 63, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCard: {
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 24,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  monthButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: BOOKING_COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    marginBottom: 24,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_SECONDARY,
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  checkInDay: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    borderRadius: 20,
  },
  checkOutDay: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    borderRadius: 20,
  },
  rangeDay: {
    backgroundColor: `${BOOKING_COLORS.PRIMARY}40`,
  },
  rangeDayText: {
    color: BOOKING_COLORS.PRIMARY,
  },
  selectedDayText: {
    color: BOOKING_COLORS.BACKGROUND,
    fontWeight: '700',
  },
  pastDay: {
    opacity: 0.3,
  },
  pastDayText: {
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  selectedDatesInfo: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: `${BOOKING_COLORS.PRIMARY}10`,
    borderRadius: 8,
  },
  selectedDatesText: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  nextButton: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  nextButtonDisabled: {
    backgroundColor: BOOKING_COLORS.TEXT_SECONDARY,
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.BACKGROUND,
  },
});

