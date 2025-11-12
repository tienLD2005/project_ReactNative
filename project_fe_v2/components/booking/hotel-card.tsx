import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { Hotel } from '@/constants/booking';
import { BOOKING_COLORS } from '@/constants/booking';

interface HotelCardProps {
  hotel: Hotel;
  variant?: 'horizontal' | 'vertical' | 'nearby';
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  variant = 'vertical',
  onPress,
  onFavoritePress,
}) => {
  const isHorizontal = variant === 'horizontal';
  const isNearby = variant === 'nearby';

  // Render stars for rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={14} color={BOOKING_COLORS.RATING} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={14} color={BOOKING_COLORS.RATING} />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={14} color="#D1D5DB" />
        );
      }
    }
    return stars;
  };

  if (isNearby) {
    return (
      <TouchableOpacity
        style={styles.cardNearby}
        onPress={onPress}
        activeOpacity={0.8}>
        <View style={styles.imageContainerNearby}>
          <ExpoImage
            source={{ uri: hotel.imageUrl }}
            style={styles.imageNearby}
            contentFit="cover"
            transition={200}
          />
          <TouchableOpacity
            style={styles.favoriteButtonNearby}
            onPress={(e) => {
              e.stopPropagation();
              onFavoritePress?.();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={hotel.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={hotel.isFavorite ? BOOKING_COLORS.HEART : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.contentNearby}>
          <View style={styles.ratingRowNearby}>
            <View style={styles.starsContainer}>
              {renderStars(hotel.rating || 0)}
            </View>
            <Text style={styles.ratingTextNearby}>
              {(hotel.rating || 0).toFixed(1)}
            </Text>
            <Text style={styles.reviewsNearby}>
              ({(hotel.reviewCount || 0)} {(hotel.reviewCount || 0) === 1 ? 'Review' : 'Reviews'})
            </Text>
          </View>
          
          <Text style={styles.hotelNameNearby} numberOfLines={1}>
            {hotel.name}
          </Text>
          
          <View style={styles.locationRowNearby}>
            <Ionicons name="location-outline" size={16} color={BOOKING_COLORS.TEXT_SECONDARY} />
            <Text style={styles.locationNearby} numberOfLines={1}>
              {hotel.location}
            </Text>
          </View>
          
          {hotel.price > 0 ? (
            <Text style={styles.priceNearby}>
              ${Math.round(hotel.price)}/night
            </Text>
          ) : (
            <Text style={styles.pricePlaceholderNearby}>Liên hệ</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, isHorizontal && styles.cardHorizontal]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={[styles.imageContainer, isHorizontal && styles.imageContainerHorizontal]}>
        <ExpoImage
          source={{ uri: hotel.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            onFavoritePress?.();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons
            name={hotel.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={hotel.isFavorite ? BOOKING_COLORS.HEART : '#FFFFFF'}
          />
        </TouchableOpacity>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color={BOOKING_COLORS.RATING} />
          <Text style={styles.ratingText}>{(hotel.rating || 0).toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.hotelName} numberOfLines={1}>
          {hotel.name}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={BOOKING_COLORS.TEXT_SECONDARY} />
          <Text style={styles.location} numberOfLines={1}>
            {hotel.location}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.reviews}>
            ({(hotel.reviewCount || 0)} {hotel.reviewCount === 1 ? 'Review' : 'Reviews'})
          </Text>
          {hotel.price > 0 ? (
            <Text style={styles.price}>
              ${Math.round(hotel.price)}/night
            </Text>
          ) : (
            <Text style={styles.pricePlaceholder}>Liên hệ</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHorizontal: {
    width: 300,
    marginRight: 20,
    marginBottom: 0,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  imageContainerHorizontal: {
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  content: {
    padding: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '700',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    flex: 1,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  reviews: {
    fontSize: 13,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    fontWeight: '400',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },
  pricePlaceholder: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  // Nearby variant styles
  cardNearby: {
    flexDirection: 'row',
    backgroundColor: BOOKING_COLORS.BACKGROUND,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainerNearby: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  imageNearby: {
    width: '100%',
    height: '100%',
  },
  favoriteButtonNearby: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentNearby: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  ratingRowNearby: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingTextNearby: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginLeft: 4,
  },
  reviewsNearby: {
    fontSize: 12,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  hotelNameNearby: {
    fontSize: 16,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 6,
  },
  locationRowNearby: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationNearby: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  priceNearby: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  pricePlaceholderNearby: {
    fontSize: 14,
    fontWeight: '600',
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
});
