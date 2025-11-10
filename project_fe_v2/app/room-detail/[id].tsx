import { getReviewsByRoomId, ReviewResponse } from '@/apis/reviewApi';
import { getRoomById, RoomResponse } from '@/apis/roomApi';
import { BOOKING_COLORS } from '@/constants/booking';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RoomDetailScreen(): React.JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const screenWidth = Dimensions.get('window').width;
  const imageListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadRoomDetail();
  }, [id]);

  // Format date từ backend (có thể là string hoặc array)
  const formatReviewDate = (dateInput: string | number[] | null | undefined): string => {
    if (!dateInput) {
      return 'N/A';
    }

    try {
      let date: Date;

      // Handle array format [year, month, day, hour, minute, second] from backend
      if (Array.isArray(dateInput)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
        if (year && month !== undefined && day !== undefined) {
          date = new Date(year, month - 1, day, hour, minute, second); // month is 0-indexed in JS Date
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
          date = new Date(year, month - 1, day);
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

      // Format date to readable string (English format)
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateInput);
      return 'N/A';
    }
  };

  const loadRoomDetail = async () => {
    try {
      setLoading(true);
      const roomId = parseInt(id || '0', 10);
      if (isNaN(roomId)) {
        Alert.alert('Lỗi', 'ID phòng không hợp lệ');
        router.back();
        return;
      }
      const data = await getRoomById(roomId);
      setRoom(data);

      // Load reviews for this room
      try {
        const reviewsData = await getReviewsByRoomId(roomId);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Load reviews error:', error);
      }
    } catch (error) {
      console.error('Load room detail error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin phòng', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !room) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />
        <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerButton, styles.headerButtonTransparent]}>
          <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.BACKGROUND} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            style={[styles.headerButton, styles.headerButtonTransparent]}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? BOOKING_COLORS.HEART : BOOKING_COLORS.BACKGROUND}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Main Image */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (room.imageUrls && room.imageUrls.length > 0) {
              setSelectedImageIndex(0);
            }
          }}
          style={[styles.imageContainer, { width }]}>
          <ExpoImage
            source={{
              uri:
                room.imageUrls && room.imageUrls.length > 0
                  ? room.imageUrls[0]
                  : "https://via.placeholder.com/400x200?text=No+Image",
            }}
            style={styles.mainImage}
            contentFit="cover"
            transition={200}
          />
          {room.imageUrls && room.imageUrls.length > 0 && (
            <View style={styles.imageOverlay}>
              <View style={styles.imageCountBadge}>
                <Ionicons name="images-outline" size={16} color={BOOKING_COLORS.BACKGROUND} />
                <Text style={styles.imageCountText}>{room.imageUrls.length} photos</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>


        {/* Room Info */}
        <View style={styles.content}>
          <Text style={styles.roomName}>{room.roomType}</Text>

          {/* Rating - hiển thị kể cả khi bằng 0 */}
          <View style={styles.ratingRow}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(room.rating || 0) ? 'star' : 'star-outline'}
                size={16}
                color={BOOKING_COLORS.RATING}
              />
            ))}
            <Text style={styles.ratingText}>
              {(room.rating || 0).toFixed(1)} ({(room.reviewCount || 0)} {(room.reviewCount || 0) === 1 ? 'Review' : 'Reviews'})
            </Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="business-outline" size={16} color={BOOKING_COLORS.TEXT_SECONDARY} />
            <Text style={styles.location}>
              {room.hotelName || 'Thuộc khách sạn không xác định'}
            </Text>
          </View>

          {/* Description */}
          {room.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.overviewText}>{room.description}</Text>
            </View>
          )}

          {/* Photos */}
          {room.imageUrls && room.imageUrls.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Photos</Text>
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: '/room-photos/[id]',
                      params: { id: id },
                    });
                  }}>
                  <Text style={styles.viewAllText}>See all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={room.imageUrls}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setSelectedImageIndex(index)}
                    style={styles.photoThumbnail}>
                    <ExpoImage
                      source={{ uri: item }}
                      style={styles.photoImage}
                      contentFit="cover"
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosList}
              />
            </View>
          )}

          {/* Room Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.featureText}>Capacity: {room.capacity} people</Text>
          </View>

          {/* Room Highlights */}
          <View style={styles.highlightsContainer}>
            <View style={styles.highlightItem}>
              <Ionicons name="sparkles-outline" size={20} color={BOOKING_COLORS.TEXT_PRIMARY} style={styles.highlightIcon} />
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>Enhanced Clean</Text>
                <Text style={styles.highlightDescription}>This host committed to Airbnb's clone 5-step enhanced cleaning process.</Text>
              </View>
            </View>
            <View style={styles.highlightSeparator} />
            <View style={styles.highlightItem}>
              <Ionicons name="location-outline" size={20} color={BOOKING_COLORS.TEXT_PRIMARY} style={styles.highlightIcon} />
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>Great Location</Text>
                <Text style={styles.highlightDescription}>95% of recent guests give the location a 5-star rating.</Text>
              </View>
            </View>
            <View style={styles.highlightSeparator} />
            <View style={styles.highlightItem}>
              <Ionicons name="key-outline" size={20} color={BOOKING_COLORS.TEXT_PRIMARY} style={styles.highlightIcon} />
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>Great check-in-experience</Text>
                <Text style={styles.highlightDescription}>90% of recent guests gave the check-in process a 5-star rating.</Text>
              </View>
            </View>
            <View style={styles.highlightSeparator} />
            <View style={styles.highlightItem}>
              <Ionicons name="calendar-outline" size={20} color={BOOKING_COLORS.TEXT_PRIMARY} style={styles.highlightIcon} />
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>Free cancellation until 2:00 PM on</Text>
                <Text style={styles.highlightDescription}>8 May</Text>
              </View>
            </View>
          </View>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
              {reviews.slice(0, 5).map((review) => (
                <View key={review.reviewId} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUserInfo}>
                      <Text style={styles.reviewUserName}>{review.userName}</Text>
                      <View style={styles.reviewRating}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < review.rating ? 'star' : 'star-outline'}
                            size={12}
                            color={BOOKING_COLORS.RATING}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {formatReviewDate(review.createdAt as string | number[])}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))}
              {reviews.length > 5 && (
                <TouchableOpacity
                  style={styles.viewAllReviews}
                  onPress={() => {
                    // Navigate to reviews screen if needed
                  }}>
                  <Text style={styles.viewAllReviewsText}>
                    Xem tất cả {reviews.length} đánh giá
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.priceContainer}>
          {room.price && room.price > 0 ? (
            <>
              <Text style={styles.priceLabel}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)}
              </Text>
              <Text style={styles.priceSubLabel}>/night</Text>
            </>
          ) : (
            <Text style={styles.priceLabel}>Liên hệ để biết giá</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.selectDateButton}
          onPress={() => {
            router.push({
              pathname: '/booking/select-date',
              params: {
                roomId: id,
                roomName: room.roomType,
                roomPrice: room.price?.toString() || '0',
                hotelName: room.hotelName || '',
                rating: room.rating?.toString() || '0',
                reviewCount: room.reviewCount?.toString() || '0',
                roomImage: room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls[0] : '',
              },
            });
          }}>
          <Text style={styles.selectDateText}>Select Date</Text>
        </TouchableOpacity>
      </View>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={selectedImageIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImageIndex(null)}>
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" />
          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top + 10 }]}
            onPress={() => setSelectedImageIndex(null)}>
            <Ionicons name="close" size={32} color={BOOKING_COLORS.BACKGROUND} />
          </TouchableOpacity>

          {/* Image Counter */}
          {selectedImageIndex !== null && room.imageUrls && (
            <View style={[styles.imageCounter, { top: insets.top + 60 }]}>
              <Text style={styles.imageCounterText}>
                {selectedImageIndex + 1} / {room.imageUrls.length}
              </Text>
            </View>
          )}

          {/* Image Swiper */}
          {selectedImageIndex !== null && room.imageUrls && (
            <FlatList
              ref={imageListRef}
              data={room.imageUrls}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={selectedImageIndex}
              getItemLayout={(data, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                setSelectedImageIndex(newIndex);
              }}
              renderItem={({ item }) => (
                <View style={[styles.fullscreenImageContainer, { width: screenWidth }]}>
                  <ExpoImage
                    source={{ uri: item }}
                    style={styles.fullscreenImage}
                    contentFit="contain"
                    transition={200}
                  />
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
              style={styles.imageSwiper}
            />
          )}

          {/* Navigation Arrows */}
          {selectedImageIndex !== null && room.imageUrls && room.imageUrls.length > 1 && (
            <>
              {selectedImageIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navArrow, styles.navArrowLeft]}
                  onPress={() => {
                    const newIndex = selectedImageIndex - 1;
                    setSelectedImageIndex(newIndex);
                    imageListRef.current?.scrollToIndex({ index: newIndex, animated: true });
                  }}>
                  <Ionicons name="chevron-back" size={32} color={BOOKING_COLORS.BACKGROUND} />
                </TouchableOpacity>
              )}
              {selectedImageIndex < room.imageUrls.length - 1 && (
                <TouchableOpacity
                  style={[styles.navArrow, styles.navArrowRight]}
                  onPress={() => {
                    const newIndex = selectedImageIndex + 1;
                    setSelectedImageIndex(newIndex);
                    imageListRef.current?.scrollToIndex({ index: newIndex, animated: true });
                  }}>
                  <Ionicons name="chevron-forward" size={32} color={BOOKING_COLORS.BACKGROUND} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BOOKING_COLORS.BACKGROUND },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: BOOKING_COLORS.TEXT_SECONDARY },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, zIndex: 10,
  },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerButtonTransparent: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 20 },
  headerRight: { flexDirection: 'row', gap: 8 },
  scrollView: { flex: 1 },
  imageContainer: { height: 300, position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  imageCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageCountText: {
    color: BOOKING_COLORS.BACKGROUND,
    fontSize: 14,
    fontWeight: '600',
  },
  content: { padding: 16 },
  roomName: { fontSize: 24, fontWeight: '700', color: BOOKING_COLORS.TEXT_PRIMARY, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 24 },
  location: { fontSize: 16, color: BOOKING_COLORS.TEXT_SECONDARY },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: BOOKING_COLORS.TEXT_PRIMARY, marginBottom: 12 },
  viewAllText: { fontSize: 14, fontWeight: '600', color: BOOKING_COLORS.PRIMARY },
  overviewText: { fontSize: 16, color: BOOKING_COLORS.TEXT_SECONDARY, lineHeight: 24 },
  photosList: { gap: 12 },
  photoThumbnail: { width: 100, height: 100, borderRadius: 12, overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  featureText: { fontSize: 16, color: BOOKING_COLORS.TEXT_PRIMARY, lineHeight: 24, marginBottom: 8 },
  highlightsContainer: {
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    marginHorizontal: 10,
    marginBottom: 24,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
    overflow: 'hidden',
  },
  highlightItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  highlightIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  highlightDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: BOOKING_COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  highlightSeparator: {
    height: 1,
    backgroundColor: BOOKING_COLORS.BORDER,
    marginHorizontal: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BOOKING_COLORS.BORDER,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  reviewComment: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  viewAllReviews: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllReviewsText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.PRIMARY,
  },
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderTopWidth: 1, borderTopColor: BOOKING_COLORS.BORDER,
  },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  priceLabel: { fontSize: 20, fontWeight: '700', color: BOOKING_COLORS.PRICE },
  priceSubLabel: { fontSize: 14, fontWeight: '500', color: BOOKING_COLORS.TEXT_SECONDARY },
  selectDateButton: { backgroundColor: BOOKING_COLORS.PRIMARY, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  selectDateText: { fontSize: 16, fontWeight: '600', color: BOOKING_COLORS.BACKGROUND },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCounter: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageCounterText: {
    color: BOOKING_COLORS.BACKGROUND,
    fontSize: 14,
    fontWeight: '600',
  },
  imageSwiper: {
    flex: 1,
  },
  fullscreenImageContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -22 }],
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  navArrowLeft: {
    left: 20,
  },
  navArrowRight: {
    right: 20,
  },
});
