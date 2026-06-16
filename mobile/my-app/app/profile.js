import { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
// non-completed
// import { Camera } from 'expo-camera';
import { AuthContext } from "../context/AuthContext";
import { BASE_URL } from '../config/api';
const API_URL = "http://localhost:5000";
const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?name=User&background=C5A059&color=fff&size=120';

export default function Profile() {
  const { user, setUser, logout, updateProfileImage } = useContext(AuthContext);
  const [profile, setProfile]   = useState(null);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const router = useRouter();

    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { message: 'Please sign in to view your profile.' } });
            return;
        }
        fetchProfile();
    }, [user?.id]);

    // camera permission - not completed
  // useEffect(() => {
  //   (async () => {
  //    const { status } = await Camera.getCameraPermissionsAsync(); // Check first
  //     if (status === 'undetermined') {
  //       const permissionResult = await Camera.requestCameraPermissionsAsync();
  //       setHasPermission(permissionResult.status === 'granted');
  //     } else {
  //       setHasPermission(true);
  //     }
  //   })();
  // }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { 'x-auth-token': token }
      });
      setProfile(res.data);

      if(setUser){
        const updatedUser = { 
          ...user, 
          name: res.data.name,
          image: res.data.image 
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
        console.error('Error fetching profile:', err);
      }
    setLoading(false);
    };

    const onRefresh = async () => {
      setRefreshing(true);
      await fetchProfile();
      setRefreshing(false);
    };

    const handleNameUpdate = async () => {
        if (!newName.trim()) return;
        try {
            const res = await axios.put(`${API_URL}/api/users/profile`, 
                { name: newName },
                { headers: { 'x-auth-token': token } }
            );
            setProfile(res.data);
            if (setUser) setUser({ ...user, name: newName });
            localStorage.setItem('user', user ? JSON.stringify({ ...user, username: newName}) : null);
            setEditName(false);
        } catch (err) {
            alert('Failed to update name');
        }
    };

 
  const handleImageUpload = useCallback(async () => {
    // uses expo imagePicker library 
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library in Settings to change your profile picture.',
      );
      return;
    }
    // opens device image library
    const result = await ImagePicker.launchImageLibraryAsync({
      // show images only
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // enable editing
      allowsEditing: true,
      aspect: [1, 1],
      // compress image and reduce quality to 70%
      quality: 0.7,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    // mimeType: a string including type and format of file(e,g 'image/jpeg')
    const mimeType = asset.mimeType || '';
    if (mimeType && !allowedTypes.includes(mimeType.toLowerCase())) {
      Alert.alert('Invalid Format', 'Please select a JPG or PNG image.');
      return;
    }
    
    const filename = asset.uri.split('/').pop();
    const ext = filename.split('.').pop().toLowerCase();
    const type = ext === 'png' ? 'image/png' : 'image/jpeg';

    const formData = new FormData();
    formData.append('image', {
      uri: asset.uri,
      name: filename,
      type,
    });

    setUploading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/users/profile/image`,
        formData,
        {
          headers: {
            'x-auth-token': user.token,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      await updateProfileImage(res.data.image);
      Alert.alert('Success', 'Profile photo updated!');
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || 'Upload failed';
      Alert.alert('Upload Failed', msg);
    } finally {
      setUploading(false);
    }
  }, [user, updateProfileImage]);

  const handleDeleteImage = useCallback(() => {

    if (!user.image || user.image === FALLBACK_AVATAR) {
      Alert.alert('No Photo', 'You have no custom profile photo to delete.');
      return;
    }

    Alert.alert(
      'Delete Profile Photo',
      'Are you sure you want to remove your profile photo? Your avatar will reset to the default.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await axios.put(
                `${BASE_URL}/api/users/profile`,
                { image: FALLBACK_AVATAR },
                { headers: { 'x-auth-token': user.token } },
              );
              await updateProfileImage(FALLBACK_AVATAR);
              Alert.alert('Removed', 'Your profile photo has been deleted.');
            } catch (err) {
              const msg = err.response?.data?.msg || err.message || 'Delete failed';
              Alert.alert('Delete Failed', msg);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }, [user, updateProfileImage]);

  // non-completed
  // const takePicture = async () => {
  //   if (cameraRef.current) {
  //     const { status } = await Camera.getCameraPermissionsAsync();
  //     if (status !== 'granted') {
  //       alert('Camera permission is required to take a picture.');
  //       const permissionResult = await Camera.requestCameraPermissionsAsync();
  //       setHasPermission(permissionResult.status === 'granted');
  //       return;
  //     }
  //     const photo = await cameraRef.current.takePictureAsync();
  //     setImage(photo.uri);
  //   }
  // };

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

  // user image might be stale, a profile object with fresh data is prioritized
  const avatarSource = profile.image
    ? { uri: profile.image }
    : { uri: user.image };

  return (
    <ScrollView style={styles.container} 
        showsVerticalScrollIndicator={false}
              refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handleImageUpload}
          disabled={uploading || deleting}
          activeOpacity={0.8}
        >
          <Image
            source={profile?.image}
            style={styles.avatarImage}
            defaultSource={{ uri: FALLBACK_AVATAR }}
          />
          <View style={styles.cameraOverlay}>
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.cameraIcon}>📷</Text>
            )}
          </View>
          {user.image && user.image !== FALLBACK_AVATAR && (
            <TouchableOpacity
              style={styles.deleteOverlay}
              onPress={handleDeleteImage}
              disabled={deleting}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              {deleting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.deleteOverlayIcon}>✕</Text>
              }
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <Text style={styles.name}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user.role || "Member"}</Text>
        </View>
        <TouchableOpacity onPress={handleImageUpload} disabled={uploading}>
          <Text style={styles.changePhotoText}>
            {uploading ? 'Uploading…' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {user.role !== "admin" && (
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
      )}

      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>Account Settings</Text>

        {/* <TouchableOpacity style={styles.menuItem} onPress={handleImageUpload} disabled={uploading || deleting}>
          <Text style={styles.menuItemText}>🖼️ Change Profile Photo</Text>
          {uploading && <ActivityIndicator size="small" color="#C5A059" style={{ marginLeft: 8 }} />}
        </TouchableOpacity> */}


        {user.role !== "admin" && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/user-lists")}
          >
            <Text style={styles.menuItemText}>📚 My Reading Lists</Text>
          </TouchableOpacity>
        )}



        {user.role === "admin" && (
          <TouchableOpacity
            style={[styles.menuItem, styles.adminItem]}
            onPress={() => router.push("/admin-dashboard")}
          >
            <Text style={styles.adminItemText}>🛠️ Admin Control Panel</Text>
          </TouchableOpacity>
        )}

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
    position: 'relative',
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    position: 'relative', 
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fef3c7",
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#C5A059',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraIcon: { fontSize: 13 },
  deleteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

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
