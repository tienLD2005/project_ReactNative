import { verifyOtp } from '@/apis';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
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

export default function VerifyOtpScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const email = params.email as string;
    const purpose = (params.purpose as string) || 'REGISTER';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);

    // Refs for input fields
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleOtpChange = (text: string, index: number) => {
        // Only allow numbers
        if (text && !/^\d+$/.test(text)) return;

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto focus next input
        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        // Handle backspace
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            Alert.alert('Error', 'Please enter all 6 digits');
            return;
        }

        setLoading(true);
        try {
            const response = await verifyOtp(email, otpCode, purpose);

            Alert.alert('Success', 'Account verified successfully!', [
                {
                    text: 'OK',
                    onPress: () => router.replace('/(auth)/login'),
                },
            ]);
        } catch (error: any) {
            // Chỉ log trong development mode
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'OTP verification failed. Please try again.';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = () => {
        Alert.alert(
            'Resend OTP',
            'A new OTP code will be sent to your email.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Resend',
                    onPress: () => {
                        // Navigate back to register to resend
                        Alert.alert('Info', 'Please register again to receive a new OTP code.', [
                            {
                                text: 'OK',
                                onPress: () => router.replace('/(auth)/register'),
                            },
                        ]);
                    },
                },
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.gradient}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>✓</Text>
                        </View>
                        <Text style={styles.title}>Verify Your Account</Text>
                        <Text style={styles.subtitle}>
                            We've sent a 6-digit code to{'\n'}
                            <Text style={styles.emailText}>{email}</Text>
                        </Text>
                    </View>

                    {/* OTP Input */}
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref: any) => (inputRefs.current[index] = ref)}
                                style={[
                                    styles.otpInput,
                                    digit ? styles.otpInputFilled : null,
                                ]}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={({ nativeEvent: { key } }) =>
                                    handleKeyPress(key, index)
                                }
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                autoFocus={index === 0}
                            />
                        ))}
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                        style={[
                            styles.verifyButton,
                            loading && styles.verifyButtonDisabled,
                        ]}
                        onPress={handleVerifyOtp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.verifyButtonText}>Verify Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Resend OTP */}
                    <TouchableOpacity
                        style={styles.resendContainer}
                        onPress={handleResendOtp}
                        disabled={loading}
                    >
                        <Text style={styles.resendText}>
                            Didn't receive the code?{' '}
                            <Text style={styles.resendLink}>Resend OTP</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Back to Login */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.replace('/(auth)/login')}
                    >
                        <Text style={styles.backButtonText}>← Back to Login</Text>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    logoText: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 20,
    },
    emailText: {
        fontWeight: 'bold',
        color: '#fff',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        paddingHorizontal: 10,
    },
    otpInput: {
        width: 50,
        height: 60,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    otpInputFilled: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderColor: '#fff',
    },
    verifyButton: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    verifyButtonDisabled: {
        opacity: 0.6,
    },
    verifyButtonText: {
        color: '#3b5998',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    resendText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    resendLink: {
        fontWeight: 'bold',
        color: '#fff',
        textDecorationLine: 'underline',
    },
    backButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    backButtonText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
});

