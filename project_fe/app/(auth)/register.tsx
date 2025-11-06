import { register, RegisterRequest } from '@/apis';
import { RegisterFormErrors } from '@/utils/validation';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RegisterScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        dateOfBirth: new Date(2000, 0, 1), // Default date
        gender: 'MALE' as 'MALE' | 'FEMALE',
    });
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errors, setErrors] = useState<RegisterFormErrors>({});

    const handleDateOfBirthChange = (date: Date) => {
        setFormData({ ...formData, dateOfBirth: date });
        // Clear error khi user chọn date mới
        if (errors.dateOfBirth) {
            setErrors(prev => ({ ...prev, dateOfBirth: undefined }));
        }
    };

    const handleRegister = async () => {
        // Clear errors trước khi submit
        setErrors({});
        setLoading(true);
        try {
            // Format date to dd-MM-yyyy (backend expects this format)
            const date = formData.dateOfBirth;
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const dateStr = `${day}-${month}-${year}`;

            const registerData: RegisterRequest = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                gender: formData.gender,
                password: formData.password,
                dateOfBirth: dateStr, // Format: dd-MM-yyyy
            };

            const response = await register(registerData);

            if (response.success) {
                Alert.alert(
                    'Success',
                    'Registration successful! Please check your email for the OTP code to verify your account.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.push({
                                pathname: '/(auth)/verify-otp',
                                params: {
                                    email: formData.email.trim(),
                                    purpose: 'REGISTER'
                                }
                            }),
                        },
                    ]
                );
            }
        } catch (error: any) {
            
            // Backend trả về field errors qua data field (Map<String, String>)
            if (error.response?.status === 400 && error.response?.data?.data && typeof error.response.data.data === 'object') {
                // Hiển thị field errors dưới các input tương ứng
                setErrors(error.response.data.data);
                return;
            }

            // Các lỗi khác (network, server error, etc.) hiển thị Alert
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Registration failed. Please check your connection.';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Logo Header */}
                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>C</Text>
                    </View>
                    <Text style={styles.brandText}>live Green</Text>
                </View>

                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Register Now!</Text>
                    <Text style={styles.subtitle}>Enter your information below</Text>
                </View>

                {/* Name Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Name</Text>
                    <View style={[styles.inputWrapper, errors.name && styles.inputWrapperError]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Curtis Weaver"
                            placeholderTextColor="#999999"
                            value={formData.name}
                            onChangeText={(text) => {
                                setFormData({ ...formData, name: text });
                                if (errors.name) {
                                    setErrors(prev => ({ ...prev, name: undefined }));
                                }
                            }}
                            editable={!loading}
                        />
                    </View>
                    {errors.name && (
                        <Text style={styles.errorText}>{errors.name}</Text>
                    )}
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                        <TextInput
                            style={styles.input}
                            placeholder="curtis.weaver@example.com"
                            placeholderTextColor="#999999"
                            value={formData.email}
                            onChangeText={(text) => {
                                setFormData({ ...formData, email: text });
                                if (errors.email) {
                                    setErrors(prev => ({ ...prev, email: undefined }));
                                }
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>
                    {errors.email && (
                        <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#999999"
                            value={formData.password}
                            onChangeText={(text) => {
                                setFormData({ ...formData, password: text });
                                if (errors.password) {
                                    setErrors(prev => ({ ...prev, password: undefined }));
                                }
                            }}
                            secureTextEntry
                            editable={!loading}
                        />
                    </View>
                    {errors.password && (
                        <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                </View>

                {/* Mobile Number Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mobile Number</Text>
                    <View style={[styles.inputWrapper, errors.phoneNumber && styles.inputWrapperError]}>
                        <TextInput
                            style={styles.input}
                            placeholder="(209) 555-0104"
                            placeholderTextColor="#999999"
                            value={formData.phoneNumber}
                            onChangeText={(text) => {
                                setFormData({ ...formData, phoneNumber: text });
                                if (errors.phoneNumber) {
                                    setErrors(prev => ({ ...prev, phoneNumber: undefined }));
                                }
                            }}
                            keyboardType="phone-pad"
                            editable={!loading}
                        />
                    </View>
                    {errors.phoneNumber && (
                        <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                    )}
                </View>

                {/* Date of Birth Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <TouchableOpacity
                        style={[styles.dateInput, errors.dateOfBirth && styles.inputWrapperError]}
                        onPress={() => setShowDatePicker(true)}
                        disabled={loading}
                    >
                        <Text style={styles.dateText}>{formatDate(formData.dateOfBirth)}</Text>
                        <Text style={styles.calendarIcon}>
                        
                        </Text>
                    </TouchableOpacity>
                    {errors.dateOfBirth && (
                        <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                    )}
                    {showDatePicker && (
                        <DateTimePicker
                            value={formData.dateOfBirth}
                            mode="date"
                            display="default"
                            maximumDate={new Date()}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (selectedDate) {
                                    handleDateOfBirthChange(selectedDate);
                                }
                            }}
                        />
                    )}
                </View>

                {/* Gender Selection */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.genderContainer}>
                        <TouchableOpacity
                            style={[
                                styles.genderButton,
                                formData.gender === 'MALE' && styles.genderButtonActive,
                            ]}
                            onPress={() => setFormData({ ...formData, gender: 'MALE' })}
                            disabled={loading}
                        >
                            <View style={[
                                styles.radio,
                                formData.gender === 'MALE' && styles.radioActive,
                            ]}>
                                {formData.gender === 'MALE' && <View style={styles.radioDot} />}
                            </View>
                            <Text style={[
                                styles.genderText,
                                formData.gender === 'MALE' && styles.genderTextActive,
                            ]}>
                                Male
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.genderButton,
                                formData.gender === 'FEMALE' && styles.genderButtonActive,
                            ]}
                            onPress={() => setFormData({ ...formData, gender: 'FEMALE' })}
                            disabled={loading}
                        >
                            <View style={[
                                styles.radio,
                                formData.gender === 'FEMALE' && styles.radioActive,
                            ]}>
                                {formData.gender === 'FEMALE' && <View style={styles.radioDot} />}
                            </View>
                            <Text style={[
                                styles.genderText,
                                formData.gender === 'FEMALE' && styles.genderTextActive,
                            ]}>
                                Female
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>


                {/* Register Button */}
                <TouchableOpacity
                    style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.registerButtonText}>Register</Text>
                    )}
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already a member? </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.loginLink}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 60,
        paddingBottom: 30,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '300',
        color: '#6C63FF',
        fontFamily: 'serif',
    },
    brandText: {
        fontSize: 24,
        fontWeight: '400',
        color: '#6C63FF',
        fontFamily: 'serif',
        letterSpacing: 1,
    },
    titleContainer: {
        marginBottom: 25,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#999999',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        color: '#6C63FF',
        marginBottom: 8,
        fontWeight: '500',
    },
    inputWrapper: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#6C63FF',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputWrapperError: {
        borderColor: '#FF5252',
        borderWidth: 1.5,
        backgroundColor: '#FFF5F5',
    },
    input: {
        paddingVertical: 14,
        fontSize: 15,
        color: '#000000',
    },
    errorText: {
        color: '#FF5252',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: '500',
    },
    dateInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#6C63FF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 15,
        color: '#000000',
    },
    calendarIcon: {
        fontSize: 20,
    },
    genderContainer: {
        flexDirection: 'column',
        gap: 12,
    },
    genderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    genderButtonActive: {
        // Active state handled by radio button
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#CCCCCC',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioActive: {
        borderColor: '#6C63FF',
    },
    radioDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#6C63FF',
    },
    genderText: {
        fontSize: 16,
        color: '#000000',
    },
    genderTextActive: {
        fontWeight: '500',
    },
    registerButton: {
        backgroundColor: '#6C63FF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    registerButtonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: '#000000',
        fontSize: 14,
    },
    loginLink: {
        color: '#6C63FF',
        fontSize: 14,
        fontWeight: '600',
    },
});
