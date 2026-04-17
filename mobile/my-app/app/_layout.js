import { Tabs } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { View, Text, StyleSheet } from "react-native";
import LogoHeader from "../components/LogoHeader";
import ChatbotButton from "../components/ChatbotButton";

function TabIcon({ icon, label, focused }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            header: () => <LogoHeader />,
            tabBarStyle: styles.tabBar,
            tabBarShowLabel: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon="🏠" label="Home" focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon="🔍" label="Search" focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="categories"
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon="⊞" label="Categories" focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon="👤" label="Profile" focused={focused} />
              ),
            }}
          />

          <Tabs.Screen name="auth/login" options={{ href: null }} />
          <Tabs.Screen name="auth/register" options={{ href: null }} />
          <Tabs.Screen name="dashboard" options={{ href: null }} />
          <Tabs.Screen name="admin-dashboard" options={{ href: null }} />
        </Tabs>

        <ChatbotButton />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fdfaf6',
    borderTopWidth: 2,
    borderTopColor: '#C5A059',
    height: 65,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 10,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.45,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: '#8e7f68',
    marginTop: 2,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#C5A059',
    fontWeight: '800',
  },
});
