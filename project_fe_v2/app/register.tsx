import DateTimePicker from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import Input from "../components/Input";
import axiosInstance from "../utils/axiosInstance";

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: new Date(2000, 0, 1), // Khởi tạo với ngày hợp lý
    gender: "Male" as "Male" | "Female",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string | Date) => {
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: "" }); // xóa lỗi khi user nhập lại
  };

  const formatDate = (date: Date) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length > 0 && cleaned[0] !== "0") {
      return "0" + cleaned.slice(0, 9);
    }
    const limited = cleaned.slice(0, 10);
    if (limited.length <= 3) return `(${limited}`;
    if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6, 10)}`;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    handleChange("phoneNumber", formatted);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const { fullName, email, phoneNumber } = form;
    const phoneNumberClean = phoneNumber.replace(/\D/g, "");

    if (!fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";

    if (!email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(email))
      newErrors.email = "Email phải có định dạng @gmail.com";

    if (!phoneNumberClean) newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    else if (!/^0\d{9}$/.test(phoneNumberClean))
      newErrors.phoneNumber = "Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const onRegister = async () => {
    if (!validateForm()) return;

    const { fullName, email, phoneNumber, dateOfBirth, gender } = form;
    const phoneNumberClean = phoneNumber.replace(/\D/g, "");

    const year = dateOfBirth.getFullYear();
    const month = String(dateOfBirth.getMonth() + 1).padStart(2, "0");
    const day = String(dateOfBirth.getDate()).padStart(2, "0");
    const dateOfBirthFormatted = `${year}-${month}-${day}`;

    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/register", {
        fullName,
        email,
        phoneNumber: phoneNumberClean,
        dateOfBirth: dateOfBirthFormatted,
        gender,
      });

      if (res.status === 200 || res.status === 201) {
        if (res.data?.success || res.data?.data) {
          Alert.alert("Thành công", res.data?.message || "Đăng ký thành công. Vui lòng kiểm tra mã OTP.");
          router.push({
            pathname: "/verify-otp",
            params: { phoneNumber: phoneNumberClean },
          });
        } else {
          Alert.alert("Lỗi", res?.data?.message || "Không thể đăng ký");
        }
      } else {
        Alert.alert("Lỗi", res?.data?.message || "Không thể đăng ký");
      }
    } catch (e: any) {
      const errorMessage =
        e?.response?.data?.message ||
        e?.response?.data?.errors ||
        "Đã xảy ra lỗi khi đăng ký";
      Alert.alert("Đăng ký thất bại", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.fullName.length > 0 &&
    form.email.length > 0 &&
    form.phoneNumber.replace(/\D/g, "").length === 10;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
          <Text style={styles.title}>Register Now!</Text>
          <Text style={styles.subtitle}>Enter your information below</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter Full Name"
            value={form.fullName}
            onChangeText={(text: any) => handleChange("fullName", text)}
            error={errors.fullName}
          />

          <Input
            label="Email Address"
            placeholder="Enter Email"
            value={form.email}
            onChangeText={(text: any) => handleChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Mobile Number"
            placeholder="Enter Mobile Number"
            value={form.phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            error={errors.phoneNumber}
          />

          <Input
            label="Date of Birth"
            placeholder="Select Date of Birth"
            onChangeText={() => { }}
            value={formatDate(form.dateOfBirth)}
            editable={false}
            onPress={() => setShowDatePicker(true)}
            rightIcon="calendar-outline"
            onRightIconPress={() => setShowDatePicker(true)}
          />
          {Platform.OS === "ios" && (
            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={styles.datePickerButton}
                    >
                      <Text style={styles.datePickerButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={styles.datePickerButton}
                    >
                      <Text style={[styles.datePickerButtonText, styles.datePickerButtonTextPrimary]}>
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.datePickerWrapper}>
                    <DateTimePicker
                      value={form.dateOfBirth}
                      mode="date"
                      display="inline"
                      onChange={(event: any, selectedDate?: Date) => {
                        if (selectedDate) {
                          handleChange("dateOfBirth", selectedDate);
                        }
                      }}
                      maximumDate={new Date()}
                      minimumDate={new Date(1900, 0, 1)}
                      textColor="#000000"
                      accentColor="#3182CE"
                      themeVariant="light"
                      locale="en_US"
                    />
                  </View>
                </View>
              </View>
            </Modal>
          )}
          {Platform.OS === "android" && showDatePicker && (
            <DateTimePicker
              value={form.dateOfBirth}
              mode="date"
              display="default"
              onChange={(event: any, selectedDate?: Date) => {
                setShowDatePicker(false);
                if (event.type === "set" && selectedDate) {
                  handleChange("dateOfBirth", selectedDate);
                }
              }}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          )}

          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>Gender</Text>
            <View style={styles.genderOptions}>
              {["Male", "Female"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderOption, form.gender === g && styles.genderOptionSelected]}
                  onPress={() => handleChange("gender", g)}
                >
                  <View
                    style={[
                      styles.radioButton,
                      form.gender === g && styles.radioButtonSelected,
                    ]}
                  >
                    {form.gender === g && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text
                    style={[
                      styles.genderText,
                      form.gender === g && styles.genderTextSelected,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Register"
            onPress={onRegister}
            variant="primary"
            isLoading={loading}
            disabled={loading}
          />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already a member? </Text>
          <Text style={styles.loginLink} onPress={() => router.replace("/login")}>
            Login
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  logoContainer: {
    justifyContent: "flex-start",
    marginBottom: 20,
    marginLeft: -35,
  },
  logo: {
    width: 250,
    height: 120,
  },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#718096" },
  form: { marginBottom: 24 },
  genderContainer: { marginBottom: 24 },
  genderLabel: { fontSize: 14, fontWeight: "600", color: "#1A202C", marginBottom: 12 },
  genderOptions: { flexDirection: "row", gap: 16 },
  genderOption: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioButtonSelected: { borderColor: "#3182CE" },
  radioButtonInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#3182CE" },
  genderText: { fontSize: 16, color: "#4A5568" },
  genderTextSelected: { color: "#3182CE", fontWeight: "500" },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  genderOptionSelected: { backgroundColor: "#EBF8FF", borderRadius: 8, paddingHorizontal: 8 },

  loginText: { fontSize: 14, color: "#718096" },
  loginLink: { fontSize: 14, color: "#3182CE", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  datePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 20,
    maxHeight: 500,
    overflow: "hidden",
    width: "100%",
  },
  datePickerWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  datePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: "#718096",
  },
  datePickerButtonTextPrimary: {
    color: "#3182CE",
    fontWeight: "600",
  },
});
