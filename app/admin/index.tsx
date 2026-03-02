import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useAnnouncements } from "@/context/AnnouncementContext";
import { Colors } from "@/constants/colors";

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { announcements } = useAnnouncements();

  const counts = {
    total: announcements.length,
    Academic: announcements.filter((a) => a.category === "Academic").length,
    Events: announcements.filter((a) => a.category === "Events").length,
    Emergency: announcements.filter((a) => a.category === "Emergency").length,
    General: announcements.filter((a) => a.category === "General").length,
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: botPad + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroSection, { paddingTop: topPad + 16 }]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroGreeting}>Admin Panel</Text>
            <Text style={styles.heroName}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.mainStatCard}>
            <Text style={styles.mainStatNumber}>{counts.total}</Text>
            <Text style={styles.mainStatLabel}>Total Announcements</Text>
          </View>
        </View>

        <View style={styles.miniStatsRow}>
          {[
            { label: "Academic", count: counts.Academic, color: Colors.info },
            { label: "Events", count: counts.Events, color: Colors.success },
            { label: "Emergency", count: counts.Emergency, color: Colors.danger },
            { label: "General", count: counts.General, color: "#8E44AD" },
          ].map((s) => (
            <View key={s.label} style={[styles.miniStat, { borderTopColor: s.color }]}>
              <Text style={[styles.miniStatNum, { color: s.color }]}>{s.count}</Text>
              <Text style={styles.miniStatLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={[styles.actionCard, styles.primaryAction]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/admin/add");
          }}
          activeOpacity={0.85}
        >
          <View style={styles.actionCardLeft}>
            <View style={[styles.actionIconBg, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
              <Ionicons name="add" size={26} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.primaryActionTitle}>Post Announcement</Text>
              <Text style={styles.primaryActionSub}>Create a new announcement</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/admin/manage");
          }}
          activeOpacity={0.85}
        >
          <View style={styles.actionCardLeft}>
            <View style={[styles.actionIconBg, { backgroundColor: Colors.bgCream }]}>
              <Ionicons name="list-outline" size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.actionTitle}>Manage Announcements</Text>
              <Text style={styles.actionSub}>Edit or delete existing posts</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Announcements</Text>
        {announcements.slice(0, 3).map((a) => {
          const catColor = Colors.categories[a.category] || Colors.primary;
          return (
            <View key={a.id} style={styles.recentItem}>
              <View style={[styles.recentDot, { backgroundColor: catColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recentTitle} numberOfLines={1}>{a.title}</Text>
                <Text style={styles.recentCat}>{a.category}</Text>
              </View>
            </View>
          );
        })}
        {announcements.length === 0 && (
          <Text style={styles.noRecent}>No announcements yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgCream,
  },
  heroSection: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  heroGreeting: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  heroName: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    color: Colors.white,
    marginTop: 2,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    marginBottom: 16,
  },
  mainStatCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  mainStatNumber: {
    fontFamily: "Poppins_700Bold",
    fontSize: 48,
    color: Colors.white,
    lineHeight: 56,
  },
  mainStatLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  miniStatsRow: {
    flexDirection: "row",
    gap: 10,
  },
  miniStat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 12,
    padding: 12,
    borderTopWidth: 3,
    alignItems: "center",
  },
  miniStatNum: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: Colors.white,
  },
  miniStatLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  actionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryAction: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  actionCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryActionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: Colors.white,
  },
  primaryActionSub: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 1,
  },
  actionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: Colors.textPrimary,
  },
  actionSub: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  recentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  recentTitle: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: Colors.textPrimary,
  },
  recentCat: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  noRecent: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    paddingVertical: 20,
  },
});
