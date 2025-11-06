import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
    USER_TOKEN: 'userToken',
    USER_DATA: 'userData',
    HAS_SEEN_ONBOARDING: 'hasSeenOnboarding',
};

export const storage = {
    // Save token
    saveToken: async (token: string): Promise<void> => {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    },

    // Get token
    getToken: async (): Promise<string | null> => {
        return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    },

    // Remove token
    removeToken: async (): Promise<void> => {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    },

    // Save user data
    saveUserData: async (userData: any): Promise<void> => {
        await AsyncStorage.setItem(
            STORAGE_KEYS.USER_DATA,
            JSON.stringify(userData)
        );
    },

    // Get user data
    getUserData: async (): Promise<any | null> => {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    },

    // Remove user data
    removeUserData: async (): Promise<void> => {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    },

    // Mark onboarding as seen
    setOnboardingSeen: async (): Promise<void> => {
        await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true');
    },

    // Check if onboarding has been seen
    hasSeenOnboarding: async (): Promise<boolean> => {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
        return value === 'true';
    },

    // Clear all data (logout)
    clearAll: async (): Promise<void> => {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.USER_TOKEN,
            STORAGE_KEYS.USER_DATA,
        ]);
    },

    // Clear everything including onboarding (for testing/reset app)
    clearEverything: async (): Promise<void> => {
        await AsyncStorage.clear();
    },
};

