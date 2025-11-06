import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';


const BASE_URL = 'http://192.168.1.206:8080/api/v1';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds (cho email sending)
});

// Request Interceptor - Tự động thêm JWT token vào mọi request
axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            // Chỉ log trong development mode
            if (__DEV__) {
                console.error('Error getting token:', error);
            }
        }

        // Log request (tắt để giảm log)
        // if (__DEV__) {
        //     console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
        //     if (config.data) {
        //         console.log('📦 Request Data:', config.data);
        //     }
        // }

        return config;
    },
    (error) => {
        // Chỉ log trong development mode
        if (__DEV__) {
            console.error('Request Error:', error);
        }
        return Promise.reject(error);
    }
);

// Response Interceptor - Xử lý lỗi global
// axiosInstance.interceptors.response.use(
//     (response) => {
//         // Log response (tắt để giảm log)
//         // if (__DEV__) {
//         //     console.log('📥 API Response:', response.status, response.config.url);
//         //     console.log('✅ Response Data:', response.data);
//         // }
//         return response;
//     },
//     async (error: AxiosError) => {
//         // Log error (chỉ log lỗi server/network, KHÔNG log lỗi validation)
//         if (__DEV__) {
//             const status = error.response?.status;

//             // Chỉ log lỗi nghiêm trọng (500, 401, network error)
//             // KHÔNG log: 400 (validation), 409 (conflict - email đã tồn tại)
//             if (!status || status >= 500 || status === 401) {
//                 console.error('❌ API Error:', error.message);
//                 if (error.response) {
//                     console.error('Status:', error.response.status);
//                     console.error('Data:', error.response.data);
//                 }
//             }
//             // Nếu muốn tắt hoàn toàn, comment toàn bộ block if này
//         }

//         // Handle 401 Unauthorized - Token expired
//         if (error.response?.status === 401) {
//             await AsyncStorage.removeItem('userToken');
//             await AsyncStorage.removeItem('userData');
//             // Có thể dispatch event để redirect về login
//         }

//         return Promise.reject(error);
//     }
// );

export default axiosInstance;

