import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import Input from "../../components/Input";
import axiosInstance from "../../utils/axiosInstance";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue.trim()) {
      setEmailError("Vui lòng nhập email");
      return false;
    } else if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(emailValue)) {
      setEmailError("Email phải có định dạng @gmail.com");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (passwordValue: string): boolean => {
    if (!passwordValue.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError("");
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      setPasswordError("");
    }
  };

  const onLogin = async () => {
    // Clear previous errors
    setEmailError("");
    setPasswordError("");

    // Validate
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/login", {
        email: email,
        password: password,
      });

      const data = res?.data;
      if (!data) throw new Error("No data");

      if (res.status === 403) {
        Alert.alert(
          "Tài khoản chưa kích hoạt",
          data.message || "Tài khoản chưa được kích hoạt. Vui lòng hoàn tất đăng ký."
        );
        return;
      }

      const accessToken = data.token;
      const refreshToken = data.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error("Không nhận được token từ server");
      }

      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem(
        "userProfile",
        JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          avatar: data.avatar,
        })
      );

      Alert.alert("Thành công", "Đăng nhập thành công!");
      router.replace("/(tabs)");
    } catch (e: any) {
      console.log("Login error:", e?.response?.data);
      const errorMessage =
        e?.response?.data?.message || e?.response?.data?.errors || "Sai thông tin đăng nhập";
      Alert.alert("Đăng nhập thất bại", errorMessage);
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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Let's get you Login!</Text>
          <Text style={styles.subtitle}>Enter your information below</Text>
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialContainer}>
          <View style={styles.socialButtonWrapper}>
            <Button
              title="Google"
              onPress={() => { }}
              variant="outline"
              icon="logo-google"
              iconPosition="left"
              fullWidth={true}
            />
          </View>
          <View style={styles.socialSpacer} />
          <View style={styles.socialButtonWrapper}>
            <Button
              title="Facebook"
              onPress={() => { }}
              variant="outline"
              icon="logo-facebook"
              iconPosition="left"
              fullWidth={true}
            />
          </View>
        </View>

        {/* Separator */}
        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>Or login with</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="Enter Email"
            value={email}
            onChangeText={handleEmailChange}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />

          <Input
            label="Password"
            placeholder="Enter Password"
            value={password}
            onChangeText={handlePasswordChange}
            icon="lock-closed-outline"
            secureTextEntry
            showPasswordToggle
            isPasswordVisible={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            error={passwordError}
          />

          <Text style={styles.forgotPassword}>Forgot Password?</Text>

          <Button
            title="Login"
            onPress={onLogin}
            variant="primary"
            isLoading={loading}
          />
        </View>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <Text
            style={styles.registerLink}
            onPress={() => router.push("/auth/register")}
          >
            Register Now
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    justifyContent: "flex-start",
    marginBottom: 20,
    marginLeft: -35,
  },
  logo: {
    width: 250,
    height: 120,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#718096",
  },
  socialContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  socialButtonWrapper: {
    flex: 1,
  },
  socialSpacer: {
    width: 12,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#718096",
  },
  form: {
    marginBottom: 24,
  },
  forgotPassword: {
    fontSize: 14,
    color: "#3182CE",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: "#718096",
  },
  registerLink: {
    fontSize: 14,
    color: "#3182CE",
    fontWeight: "600",
  },
});