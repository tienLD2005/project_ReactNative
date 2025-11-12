import { BOOKING_COLORS } from "@/constants/booking";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/Button";
import axiosInstance from "../../utils/axiosInstance";

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 4).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);

      // Focus last input
      const nextIndex = Math.min(index + digits.length - 1, 3);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const onVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mã OTP (4 chữ số)");
      return;
    }

    const phoneNumberClean = phoneNumber.replace(/\D/g, "");
    if (!phoneNumberClean) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/verify-otp", {
        phoneNumber: phoneNumberClean,
        otp: otpCode,
      });

      if (res.status === 200 || res.status === 201) {
        // Check if response has success field (APIResponse structure)
        if (res.data?.success || res.data?.data) {
          // Navigate to set password screen
          router.push({
            pathname: "/auth/set-password",
            params: {
              phoneNumber: phoneNumberClean,
            },
          });
        } else {
          Alert.alert("Lỗi", res?.data?.message || "Mã OTP không đúng");
        }
      } else {
        Alert.alert("Lỗi", res?.data?.message || "Mã OTP không đúng");
      }
    } catch (e: any) {
      console.log("Verify OTP error:", e?.response?.data);
      const errorMessage =
        e?.response?.data?.message || e?.response?.data?.errors || "Mã OTP không đúng. Vui lòng thử lại.";
      Alert.alert("Xác thực thất bại", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (timer > 0) return;

    const phoneNumberClean = phoneNumber.replace(/\D/g, "");
    if (!phoneNumberClean) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    setResendLoading(true);
    try {
      const res = await axiosInstance.post("auth/resend-otp", {
        phoneNumber: phoneNumberClean,
      });

      if (res.status === 200 || res.status === 201) {
        if (res.data?.success || res.data?.data) {
          setTimer(60);
          setOtp(["", "", "", ""]);
          inputRefs.current[0]?.focus();
          Alert.alert("Thành công", res.data?.message || "Mã OTP mới đã được gửi");
        } else {
          Alert.alert("Lỗi", res?.data?.message || "Không thể gửi lại mã OTP");
        }
      } else {
        Alert.alert("Lỗi", res?.data?.message || "Không thể gửi lại mã OTP");
      }
    } catch (e: any) {
      const errorMessage =
        e?.response?.data?.message || e?.response?.data?.errors || "Không thể gửi lại mã OTP";
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="mail" size={32} color={BOOKING_COLORS.PRIMARY} />
            </View>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to{'\n'}
              <Text style={styles.phoneNumber}>{formatPhoneNumber(phoneNumber)}</Text>
            </Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend in {String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}
              </Text>
            ) : (
              <TouchableOpacity onPress={onResend} disabled={resendLoading}>
                <Text style={styles.resendLink}>
                  {resendLoading ? "Resending..." : "Resend"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <Button
            title="Verify"
            onPress={onVerify}
            variant="primary"
            isLoading={loading}
            disabled={otp.join("").length !== 4}
            fullWidth={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOKING_COLORS.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleContainer: {
    marginBottom: 48,
    alignItems: "center",
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${BOOKING_COLORS.PRIMARY}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: BOOKING_COLORS.TEXT_PRIMARY,
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: BOOKING_COLORS.TEXT_SECONDARY,
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  phoneNumber: {
    fontWeight: "600",
    color: BOOKING_COLORS.TEXT_PRIMARY,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: BOOKING_COLORS.BORDER,
    borderRadius: 16,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: BOOKING_COLORS.TEXT_PRIMARY,
    backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInputFilled: {
    borderColor: BOOKING_COLORS.PRIMARY,
    backgroundColor: `${BOOKING_COLORS.PRIMARY}10`,
    borderWidth: 3,
    shadowColor: BOOKING_COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
  resendLink: {
    fontSize: 14,
    color: BOOKING_COLORS.PRIMARY,
    fontWeight: "600",
  },
  timerText: {
    fontSize: 14,
    color: BOOKING_COLORS.TEXT_SECONDARY,
  },
});

