import { login } from '@/apis';
import { storage } from '@/utils/storage';
import { LoginFormErrors } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
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

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<LoginFormErrors>({});

    const handleLogin = async () => {
        // Clear errors trước khi submit
        setErrors({});
        setLoading(true);
        try {
            const response = await login({ email, password });

            if (response.success) {
                await storage.saveToken(response.data.token);
                await storage.saveUserData({
                    id: response.data.id,
                    name: response.data.name,
                    email: response.data.email,
                });

                Alert.alert('Success', 'Login successful!', [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(tabs)'),
                    },
                ]);
            }
        } catch (error: any) {
            const status = error.response?.status;
            const data = error.response?.data;

            if (status === 400 && data?.data && typeof data.data === 'object') {
                setErrors(data.data);
                return;
            }

            const msg = data?.message?.toLowerCase() || '';

            if (status === 400) {
                // Email không tồn tại
                if (msg.includes('email') && msg.includes('không') || msg.includes('not found')) {
                    setErrors({ email: data.message });
                    return;
                }

                // Sai password
                if (msg.includes('password') && (msg.includes('sai') || msg.includes('wrong'))) {
                    setErrors({ password: data.message });
                    return;
                }
            }

            if (status === 403 || msg.includes('chưa được xác minh') || msg.includes('not verified')) {
                Alert.alert(
                    'Account Not Verified',
                    'Your account has not been verified yet. Please check your email for the OTP code.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Verify Now',
                            onPress: () =>
                                router.push({
                                    pathname: '/(auth)/verify-otp',
                                    params: {
                                        email: email.trim(),
                                        purpose: 'REGISTER',
                                    },
                                }),
                        },
                    ]
                );
                return;
            }
            Alert.alert('Error', data?.message || 'Login failed.');
        }
        finally {
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
                    <Text style={styles.title}>Let's get you Login!</Text>
                    <Text style={styles.subtitle}>Enter your information below</Text>
                </View>

                {/* Social Login Buttons */}
                <View style={styles.socialContainer}>
                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialIcon}>G</Text>
                        <Text style={styles.socialText}>Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialIcon}>f</Text>
                        <Text style={styles.socialText}>Facebook</Text>
                    </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or login with</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                        <Text style={styles.inputIcon}>
                            <Ionicons name="mail-outline" size={24}  color="#C0C0C0"/>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Email"
                            placeholderTextColor="#B0B0B0"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
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
                    <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                        <Text style={styles.inputIcon}>
                            <Ionicons name="lock-closed-outline" size={24} color="#C0C0C0" />
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Password"
                            placeholderTextColor="#B0B0B0"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) {
                                    setErrors(prev => ({ ...prev, password: undefined }));
                                }
                            }}
                            secureTextEntry={!showPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Text style={styles.eyeIconText}>
                                <Ionicons
                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                    color="#C0C0C0"
                                    size={22}
                                />
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {errors.password && (
                        <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => router.push('/(auth)/forgot-password')}
                >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                    style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.loginButtonText}>Login</Text>
                    )}
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                        <Text style={styles.signupLink}>Register Now</Text>
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
        marginBottom: 30,
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
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingVertical: 14,
        gap: 8,
    },
    socialIcon: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    socialText: {
        fontSize: 15,
        color: '#000000',
        fontWeight: '500',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 25,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 13,
        color: '#999999',
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    inputIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 15,
        color: '#000000',
    },
    eyeIcon: {
        padding: 5,
    },
    eyeIconText: {
        fontSize: 25,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 25,
    },
    forgotPasswordText: {
        color: '#6C63FF',
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#6C63FF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        color: '#000000',
        fontSize: 14,
    },
    signupLink: {
        color: '#6C63FF',
        fontSize: 14,
        fontWeight: '600',
    },
    inputWrapperError: {
        borderColor: '#FF5252',
        borderWidth: 1.5,
        backgroundColor: '#FFF5F5',
    },
    errorText: {
        color: '#FF5252',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: '500',
    },
});
