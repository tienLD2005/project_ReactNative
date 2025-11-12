import { BOOKING_COLORS } from "@/constants/booking";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const load = async () => {
        const json = await AsyncStorage.getItem("userProfile");
        if (isActive) setProfile(json ? JSON.parse(json) : null);
      };
      load();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const logout = async () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.multiRemove(["accessToken", "refreshToken", "userProfile"]);
            setProfile(null);
            router.replace("/auth/login");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: profile?.avatar || "https://aic.com.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-1.jpg",
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{profile?.fullName || "Khách"}</Text>
            <Text style={styles.userEmail}>{profile?.email || "Chưa đăng nhập"}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push("/profile/edit-profile")}>
            <Ionicons name="create-outline" size={20} color={BOOKING_COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/profile/edit-profile")}>
          <Ionicons name="create-outline" size={24} color="#4A5568" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="lock-closed-outline" size={24} color="#4A5568" />
          <Text style={styles.menuText}>Change Password</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="card-outline" size={24} color="#4A5568" />
          <Text style={styles.menuText}>Payment Method</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="calendar-outline" size={24} color="#4A5568" />
          <Text style={styles.menuText}>My Bookings</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <Ionicons name="eye-outline" size={24} color="#4A5568" />
          <Text style={styles.menuText}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#D1D5DB", true: BOOKING_COLORS.PRIMARY }}
            thumbColor={darkMode ? "#FFFFFF" : "#F3F4F6"}
          />
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#4A5568" />
          <Text style={styles.menuText}>Privacy Policy</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="document-text-outline" size={24} color="#4A5568" />
          <Text style={styles.menuText}>Terms & Conditions</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#A0AEC0" />
        </TouchableOpacity>
      </View>

      {profile ? (
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.push("/auth/login")}>
          <Ionicons name="log-in-outline" size={24} color="#FFFFFF" />
          <Text style={styles.logoutText}>Login</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    paddingTop: 50,
    paddingBottom: 80,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#E2E8F0",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: BOOKING_COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    marginTop: 20,
  },
  menuItem: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: "#2D3748",
  },
  logoutButton: {
    backgroundColor: BOOKING_COLORS.PRIMARY,
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
});
