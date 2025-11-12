import { BOOKING_COLORS } from "@/constants/booking";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { updateProfile, uploadAvatar } from "../../apis/authApi";
import Button from "../../components/Button";
import Input from "../../components/Input";

export default function EditProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: new Date(),
    gender: "Male" as "Male" | "Female",
    avatar: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string>("");

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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const json = await AsyncStorage.getItem("userProfile");
    if (json) {
      const profileData = JSON.parse(json);
      setProfile(profileData);

      // Parse dateOfBirth properly - avoid timezone issues
      let parsedDateOfBirth = new Date(2000, 0, 1);
      if (profileData.dateOfBirth) {
        try {
          // Handle format "YYYY-MM-DD" or full ISO string
          const dateStr = profileData.dateOfBirth;
          if (dateStr.includes('T')) {
            // For ISO strings, extract date part and parse manually to avoid timezone issues
            const dateOnly = dateStr.split('T')[0];
            const dateParts = dateOnly.split('-');
            if (dateParts.length === 3) {
              parsedDateOfBirth = new Date(
                parseInt(dateParts[0]),
                parseInt(dateParts[1]) - 1,
                parseInt(dateParts[2])
              );
            }
          } else {
            // Format "YYYY-MM-DD" - parse manually to avoid timezone issues
            const dateParts = dateStr.split('-');
            if (dateParts.length === 3) {
              parsedDateOfBirth = new Date(
                parseInt(dateParts[0]),
                parseInt(dateParts[1]) - 1,
                parseInt(dateParts[2])
              );
            }
          }
        } catch (e) {
          console.error("Error parsing dateOfBirth:", e);
        }
      }

      setForm({
        fullName: profileData.fullName || "",
        email: profileData.email || "",
        phoneNumber: profileData.phone ? formatPhoneNumber(profileData.phone) : "",
        dateOfBirth: parsedDateOfBirth,
        gender: profileData.gender || "Male",
        avatar: profileData.avatar || "",
      });
      setAvatarUri(profileData.avatar || "");
    }
  };

  const handleChange = (key: string, value: string | Date) => {
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    handleChange("phoneNumber", formatted);
  };

  const requestImagePickerPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need camera roll permissions to select images!"
        );
        return false;
      }
    }
    return true;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need camera permissions to take photos!"
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePickerPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      // Convert to base64 for now (in production, upload to cloud storage)
      // For now, we'll use the local URI and convert it when saving
      handleChange("avatar", uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      handleChange("avatar", uri);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Gallery", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const { fullName, phoneNumber } = form;
    const phoneNumberClean = phoneNumber.replace(/\D/g, "");

    if (!fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";

    if (phoneNumberClean && !/^0\d{9}$/.test(phoneNumberClean)) {
      newErrors.phoneNumber = "Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { fullName, phoneNumber, dateOfBirth, gender, avatar } = form;
      const phoneNumberClean = phoneNumber.replace(/\D/g, "");

      const year = dateOfBirth.getFullYear();
      const month = String(dateOfBirth.getMonth() + 1).padStart(2, "0");
      const day = String(dateOfBirth.getDate()).padStart(2, "0");
      const dateOfBirthFormatted = `${year}-${month}-${day}`;

      // Upload image to Cloudinary if it's a new local image
      let avatarUrl = avatar;
      if (avatar && (avatar.startsWith("file://") || avatar.startsWith("content://"))) {
        try {
          // Upload to Cloudinary
          const uploadResponse = await uploadAvatar(avatar);
          avatarUrl = uploadResponse.data?.imageUrl || avatar;
        } catch (e: any) {
          console.error("Error uploading image:", e);
          Alert.alert(
            "Lỗi",
            e?.response?.data?.message || "Không thể upload ảnh. Vui lòng thử lại."
          );
          setLoading(false);
          return;
        }
      }

      const updateData: any = {
        fullName,
        phoneNumber: phoneNumberClean || undefined,
        dateOfBirth: dateOfBirthFormatted,
        gender,
      };

      // Only update avatar if it's different from current avatar
      if (avatarUrl && avatarUrl !== profile?.avatar) {
        updateData.avatar = avatarUrl;
      }

      const response = await updateProfile(updateData);

      // Parse dateOfBirth from response (format: "YYYY-MM-DD") - avoid timezone issues
      let updatedDateOfBirth = form.dateOfBirth;
      if (response.data?.dateOfBirth) {
        try {
          const dateStr = response.data.dateOfBirth;
          // Handle format "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"
          // Extract date part only and parse manually to avoid timezone issues
          const dateOnly = dateStr.split('T')[0];
          const dateParts = dateOnly.split('-');
          if (dateParts.length === 3) {
            updatedDateOfBirth = new Date(
              parseInt(dateParts[0]),
              parseInt(dateParts[1]) - 1,
              parseInt(dateParts[2])
            );
            // Set time to noon to avoid timezone issues
            updatedDateOfBirth.setHours(12, 0, 0, 0);
          }
        } catch (e) {
          console.error("Error parsing dateOfBirth:", e);
        }
      }

      // Update local profile with all fields
      // Format date as YYYY-MM-DD without timezone conversion
      const updatedYear = updatedDateOfBirth.getFullYear();
      const updatedMonth = String(updatedDateOfBirth.getMonth() + 1).padStart(2, '0');
      const updatedDay = String(updatedDateOfBirth.getDate()).padStart(2, '0');
      const updatedDateOfBirthFormatted = `${updatedYear}-${updatedMonth}-${updatedDay}`;

      const updatedProfile = {
        ...profile,
        fullName: response.data?.fullName || fullName,
        email: response.data?.email || profile?.email,
        phone: response.data?.phoneNumber || phoneNumberClean,
        dateOfBirth: updatedDateOfBirthFormatted, // Store as YYYY-MM-DD without timezone conversion
        gender: response.data?.gender || gender,
        avatar: response.data?.avatar || avatarUrl,
      };

      await AsyncStorage.setItem("userProfile", JSON.stringify(updatedProfile));

      // Update form state to reflect changes immediately
      setForm({
        ...form,
        fullName: response.data?.fullName || fullName,
        phoneNumber: response.data?.phoneNumber ? formatPhoneNumber(response.data.phoneNumber) : phoneNumber,
        dateOfBirth: updatedDateOfBirth,
        gender: response.data?.gender || gender,
        avatar: response.data?.avatar || avatarUrl,
      });
      setAvatarUri(response.data?.avatar || avatarUrl);

      Alert.alert("Thành công", "Cập nhật profile thành công!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Update profile error:", error);
      console.error("Error response:", error?.response?.data);
      console.error("Error status:", error?.response?.status);
      Alert.alert(
        "Lỗi",
        error?.response?.data?.message || error?.message || "Không thể cập nhật profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: avatarUri || form.avatar || "https://aic.com.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-1.jpg",
              }}
              style={styles.avatar}
              contentFit="cover"
            />
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={showImagePickerOptions}
            >
              <Ionicons name="create-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <Input
            label="Name"
            placeholder="Enter your name"
            value={form.fullName}
            onChangeText={(text) => handleChange("fullName", text)}
            error={errors.fullName}
          />

          <Input
            label="Email Address"
            placeholder="Enter email"
            value={form.email}
            onChangeText={() => { }}
            editable={false}
            error={errors.email}
          />

          <Input
            label="Mobile Number"
            placeholder="Enter mobile number"
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
                      accentColor={BOOKING_COLORS.PRIMARY}
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

          {/* Gender Selection */}
          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>Gender</Text>
            <View style={styles.genderOptions}>
              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => handleChange("gender", "Male")}
              >
                <View
                  style={[
                    styles.radioButton,
                    form.gender === "Male" && styles.radioButtonSelected,
                  ]}
                >
                  {form.gender === "Male" && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.genderText}>Male</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => handleChange("gender", "Female")}
              >
                <View
                  style={[
                    styles.radioButton,
                    form.gender === "Female" && styles.radioButtonSelected,
                  ]}
                >
                  {form.gender === "Female" && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.genderText}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Update Button */}
        <Button
          title="Update"
          onPress={handleUpdate}
          variant="primary"
          isLoading={loading}
          fullWidth={true}
        />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A202C",
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BOOKING_COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  form: {
    marginBottom: 24,
  },
  genderContainer: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4A5568",
    marginBottom: 12,
  },
  genderOptions: {
    flexDirection: "row",
    gap: 24,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: BOOKING_COLORS.PRIMARY,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BOOKING_COLORS.PRIMARY,
  },
  genderText: {
    fontSize: 16,
    color: "#1A202C",
  },
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
    color: BOOKING_COLORS.PRIMARY,
    fontWeight: "600",
  },
});

