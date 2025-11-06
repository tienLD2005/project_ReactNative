import { storage } from '@/utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingItem {
    id: string;
    title: string;
    description: string;
    image: any;
}

const onboardingData: OnboardingItem[] = [
    {
        id: '1',
        title: 'Easy way to book\nhotels with us',
        description:
            'It is a long established fact that a reader will be distracted by the readable content.',
            image: { uri: "https://decoxdesign.com/upload/images/mau-khach-san-5-sao-07-decox-design.jpg" }, 
    },
    {
        id: '2',
        title: 'Find your perfect\nstay',
        description:
            'Discover thousands of hotels and resorts around the world at the best prices.',
        image: { uri: "https://anphatgroups.vn//upload/images/m%E1%BA%ABu%20kh%C3%A1ch%20s%E1%BA%A1n%205%20sao/mau-thiet-ke-khach-san-5-sao-an-phat-1.jpg" }
,
    },
    {
        id: '3',
        title: 'Book with\nconfidence',
        description:
            'Secure booking, instant confirmation, and 24/7 customer support for your peace of mind.',
        image: { uri: "https://media.vietnamplus.vn/images/7255a701687d11cb8c6bbc58a6c807854994b34e708a5e910b80d7c2ce36990b80b78284a9233d3c595111a7ab7698e6/1.jpg" }
,
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = async () => {
        if (currentIndex < onboardingData.length - 1) {
            const nextIndex = currentIndex + 1;
            flatListRef.current?.scrollToIndex({ index: nextIndex });
            setCurrentIndex(nextIndex);
        } else {
            // Last slide, navigate to login
            await storage.setOnboardingSeen();  // ← COMMENT ĐỂ TEST (Không set cờ)
            router.replace('/(auth)/login');
        }
    };

    const handleSkip = async () => {
        await storage.setOnboardingSeen();  // ← COMMENT ĐỂ TEST (Không set cờ)
        router.replace('/(auth)/login');
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const renderItem = ({ item }: { item: OnboardingItem }) => (
        <View style={styles.slide}>
            <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.image} resizeMode="cover" />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.pagination}>
                    {onboardingData.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                index === currentIndex && styles.paginationDotActive,
                            ]}
                        />
                    ))}
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={onboardingData}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />
            <View style={styles.footer}>
                <TouchableOpacity onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <LinearGradient
                        colors={['#5E72E4', '#825EE4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.nextButtonGradient}
                    >
                        <Text style={styles.nextButtonText}>
                            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                        <Text style={styles.nextButtonArrow}>→</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    slide: {
        width: width,
        height: height,
    },
    imageContainer: {
        width: width,
        height: height * 0.6,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: 30,
        paddingTop: 30,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    paginationDot: {
        width: 30,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#5E72E4',
        width: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
        lineHeight: 40,
    },
    description: {
        fontSize: 16,
        color: '#9E9E9E',
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        left: 30,
        right: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skipText: {
        fontSize: 16,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    nextButton: {
        borderRadius: 25,
        overflow: 'hidden',
    },
    nextButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 16,
        borderRadius: 25,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginRight: 8,
    },
    nextButtonArrow: {
        fontSize: 20,
        color: '#FFFFFF',
    },
});

