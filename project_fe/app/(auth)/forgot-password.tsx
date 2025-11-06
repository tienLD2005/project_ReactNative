import { forgotPassword } from '@/apis';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setError('Email is required');
            return false;
        } else if (!emailRegex.test(email)) {
            setError('Invalid email format');
            return false;
        }
        return true;
    };

    const handleSendOTP = async () => {
        if (!validateEmail()) {
            return;
        }

        setLoading(true);
        try {
            const response = await forgotPassword(email);
            Alert.alert(
                'Success',
                'OTP has been sent to your email. Please check your inbox.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'An error occurred while sending OTP. Please check your connection.';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>🔒</Text>
                    </View>
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>
                        Enter your email address and we'll send you an OTP to reset your
                        password.
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, error && styles.inputError]}
                            placeholder="Enter your email"
                            placeholderTextColor="#9E9E9E"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    </View>

                    {/* Send OTP Button */}
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSendOTP}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#5E72E4', '#825EE4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.sendButtonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.sendButtonText}>Send OTP</Text>
                            )}
                        </LinearGradient>
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
    },
    backButton: {
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButtonText: {
        fontSize: 16,
        color: '#5E72E4',
        fontWeight: '600',
    },
    header: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8EAFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoText: {
        fontSize: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        color: '#9E9E9E',
        textAlign: 'center',
        lineHeight: 20,
    },
    formContainer: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: '#FF5252',
    },
    errorText: {
        color: '#FF5252',
        fontSize: 12,
        marginTop: 4,
    },
    sendButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    sendButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

