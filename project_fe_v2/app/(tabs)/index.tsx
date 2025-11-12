import { getAllRooms, RoomResponse } from '@/apis/roomApi';
import { CityButton } from '@/components/booking/city-button';
import { HotelCard } from '@/components/booking/hotel-card'; // Có thể đổi tên sang RoomCard sau
import { SearchBar } from '@/components/booking/search-bar';
import { BOOKING_COLORS, City, Hotel as Room } from '@/constants/booking';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, usePreventRemove } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [bestRooms, setBestRooms] = useState<Room[]>([]);
  const [nearbyRooms, setNearbyRooms] = useState<Room[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Prevent back navigation on home screen
  usePreventRemove(true, () => {
    // Prevent back navigation
  });

  // Disable gesture and handle Android back button
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });

    // Handle Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Prevent back navigation on home screen
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllRooms();
      const mappedRooms = mapRoomResponseToRoom(data);

      // Lấy 2 phòng đầu tiên làm nổi bật
      setBestRooms(mappedRooms.slice(0, 2));
      // Các phòng còn lại
      setNearbyRooms(mappedRooms.slice(2));

      // Lấy city từ danh sách phòng
      const hotelSet = new Set<string>();
      data.forEach((room) => {
        if (room.hotelName) {
          hotelSet.add(room.hotelName);
        }
      });
      const citiesList: City[] = Array.from(hotelSet)
        .slice(0, 5)
        .map((hotelName, index) => ({
          id: (index + 1).toString(),
          name: hotelName,
          imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=200',
        }));
      setCities(citiesList);
    } catch (error) {
      // console.error('Load rooms error:', error);
      setBestRooms([]);
      setNearbyRooms([]);
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload data mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      loadRooms();
    }, [loadRooms])
  );

  const mapRoomResponseToRoom = (data: RoomResponse[]): Room[] => {
    return data.map((item) => ({
      id: item.roomId?.toString(),
      name: item.roomType || "Không rõ loại phòng",
      location: item.hotelName || "Không rõ khách sạn",
      price: item.price ?? 0,
      rating: item.rating ?? 0,
      reviewCount: item.reviewCount ?? 0,
      imageUrl:
        (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : "") ||
        "",
      isFavorite: false,
    }));
  };


  const toggleFavorite = (roomId: string, list: Room[], setList: (rooms: Room[]) => void): void => {
    setList(
      list.map((room) =>
        room.id === roomId ? { ...room, isFavorite: !room.isFavorite } : room
      )
    );
  };

  const renderSectionHeader = (title: string, onSeeAll?: () => void): React.JSX.Element => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BOOKING_COLORS.PRIMARY} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="grid-outline" size={22} color={BOOKING_COLORS.BACKGROUND} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Green</Text>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => router.push('/(tabs)/account')}
        >
          <Ionicons name="person-outline" size={22} color={BOOKING_COLORS.BACKGROUND} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Search Bar */}
        <SearchBar onPress={() => router.push('/search')} />

        {/* City Categories */}
        {cities.length > 0 && (
          <View style={styles.citiesSection}>
            <FlatList
              data={cities}
              renderItem={({ item }) => (
                <CityButton city={item} onPress={() => router.push('/filter')} />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.citiesList}
            />
          </View>
        )}

        {/* Featured Rooms */}
        {renderSectionHeader('Best Rooms', () => router.push('/filter'))}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
          </View>
        ) : (
          <FlatList
            data={bestRooms}
            renderItem={({ item }) => (
              <HotelCard
                hotel={item}
                variant="horizontal"
                onPress={() => router.push(`/room-detail/${item.id}`)}
                onFavoritePress={() => toggleFavorite(item.id, bestRooms, setBestRooms)}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hotelsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có phòng nổi bật</Text>
              </View>
            }
          />
        )}

        {/* Nearby Rooms */}
        {renderSectionHeader('Nearby your location', () => router.push('/filter'))}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
          </View>
        ) : (
          <View style={styles.nearbyHotels}>
            {nearbyRooms.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có phòng gần đây</Text>
              </View>
            ) : (
              nearbyRooms.map((room) => (
                <HotelCard
                  key={room.id}
                  hotel={room}
                  variant="nearby"
                  onPress={() => router.push(`/room-detail/${room.id}`)}
                  onFavoritePress={() => toggleFavorite(room.id, nearbyRooms, setNearbyRooms)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: BOOKING_COLORS.PRIMARY,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: BOOKING_COLORS.BACKGROUND,
    letterSpacing: 0.5,
  },
  scrollView: { flex: 1 },
  citiesSection: { marginTop: 8, marginBottom: 32 },
  citiesList: { paddingHorizontal: 20, paddingRight: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: BOOKING_COLORS.TEXT_PRIMARY, letterSpacing: -0.5 },
  seeAllText: { fontSize: 15, fontWeight: '600', color: BOOKING_COLORS.PRIMARY },
  hotelsList: { paddingHorizontal: 20, paddingBottom: 12 },
  nearbyHotels: { paddingHorizontal: 20, paddingBottom: 32 },
  loadingContainer: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: BOOKING_COLORS.TEXT_SECONDARY },
});
