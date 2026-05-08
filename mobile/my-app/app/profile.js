import { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  if (!user) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.emoji}>📖</Text>
        <Text style={styles.guestTitle}>Join LearnNova</Text>
        <Text style={styles.guestSubtitle}>
          Sign in to track your reading progress and manage your lists.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push("/auth/register")}
        >
          <Text style={styles.secondaryBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user.username || "U")[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user.role || "Member"}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Finished</Text>
        </View>
        <View style={[styles.statBox, styles.statBorder]}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Reading</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>28</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>Account Settings</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>👤 Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/user-lists")}
        >
          <Text style={styles.menuItemText}>📚 My Reading Lists</Text>
        </TouchableOpacity>

        {user.role === "admin" && (
          <TouchableOpacity
            style={[styles.menuItem, styles.adminItem]}
            onPress={() => router.push("/admin-dashboard")}
          >
            <Text style={styles.adminItemText}>🛠️ Admin Control Panel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>🔔 Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={logout}
        >
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfaf6" },
  guestContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#fdfaf6",
  },
  emoji: { fontSize: 60, marginBottom: 20 },
  guestTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },

  header: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 4,
    borderColor: "#fef3c7",
  },
  avatarText: { fontSize: 40, fontWeight: "bold", color: "#fff" },
  name: { fontSize: 22, fontWeight: "bold", color: "#1e293b" },
  email: { fontSize: 14, color: "#64748b", marginTop: 4 },
  badge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  badgeText: {
    fontSize: 12,
    color: "#d97706",
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 15,
    paddingVertical: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  statBox: { flex: 1, alignItems: "center" },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#f1f5f9",
  },
  statNumber: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 2 },

  menuSection: { padding: 25 },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#94a3b8",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  menuItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  menuItemText: { fontSize: 15, color: "#334155", fontWeight: "500" },
  adminItem: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  adminItemText: { color: "#2563eb", fontWeight: "bold" },
  logoutItem: { marginTop: 20, borderColor: "#fee2e2" },
  logoutText: { color: "#dc2626", fontWeight: "bold" },

  primaryBtn: {
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    width: "100%",
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtn: {
    marginTop: 15,
    paddingVertical: 14,
    width: "100%",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  secondaryBtnText: { color: "#f59e0b", fontWeight: "bold", fontSize: 16 },
});
