import { BOOKING_COLORS } from "@/constants/booking";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Button from "../../components/Button";
import Input from "../../components/Input";
import axiosInstance from "../../utils/axiosInstance";

export default function SetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mật khẩu");
      return;
    }

    if (password.length < 6 || password.length > 100) {
      Alert.alert("Lỗi", "Password phải từ 6 đến 100 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    const phoneNumberClean = phoneNumber.replace(/\D/g, "");
    if (!phoneNumberClean || !/^0\d{9}$/.test(phoneNumberClean)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      // Complete registration with password - only send phoneNumber and password
      const res = await axiosInstance.post("auth/complete-registration", {
        phoneNumber: phoneNumberClean,
        password,
      });

      if (res.status === 200 || res.status === 201) {
        // Check if response has success field (APIResponse structure)
        if (res.data?.success || res.data?.data) {
          Alert.alert("Thành công", res.data?.message || "Đăng ký hoàn tất thành công! Hãy đăng nhập ngay.", [
            {
              text: "OK",
              onPress: () => router.replace("/auth/login"),
            },
          ]);
        } else {
          Alert.alert("Lỗi", res?.data?.message || "Không thể hoàn tất đăng ký");
        }
      } else {
        Alert.alert("Lỗi", res?.data?.message || "Không thể hoàn tất đăng ký");
      }
    } catch (e: any) {
      console.log("Set password error:", e?.response?.data);
      const errorMessage =
        e?.response?.data?.message || e?.response?.data?.errors || "Đã xảy ra lỗi khi đặt mật khẩu";
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
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
              <Ionicons name="lock-closed" size={32} color={BOOKING_COLORS.PRIMARY} />
            </View>
            <Text style={styles.title}>Create Password</Text>
            <Text style={styles.subtitle}>
              Please enter a secure password for your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Password"
              placeholder="Enter Password"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              secureTextEntry
              showPasswordToggle
              isPasswordVisible={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            <Input
              label="Confirm Password"
              placeholder="Enter Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              icon="lock-closed-outline"
              secureTextEntry
              showPasswordToggle
              isPasswordVisible={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <Button
              title="Save Password"
              onPress={onSave}
              variant="primary"
              isLoading={loading}
              disabled={!password || !confirmPassword || password !== confirmPassword}
              fullWidth={true}
            />
          </View>
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
    marginBottom: 40,
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
  form: {
    gap: 24,
    marginTop: 8,
  },
});

