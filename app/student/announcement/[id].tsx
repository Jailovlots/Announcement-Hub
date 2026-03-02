import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useAnnouncements } from "@/context/AnnouncementContext";
import { Colors } from "@/constants/colors";

const categoryIcons: Record<string, string> = {
  Academic: "school-outline",
  Events: "calendar-outline",
  Emergency: "warning-outline",
  General: "information-circle-outline",
};

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

export default function AnnouncementDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { announcements } = useAnnouncements();
  const announcement = announcements.find((a) => a.id === id);

  if (!announcement) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={52} color={Colors.textLight} />
        <Text style={styles.notFoundText}>Announcement not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const catColor = Colors.categories[announcement.category] || Colors.primary;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Detail</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.categoryBadge, { backgroundColor: catColor + "22", borderColor: catColor + "44" }]}>
          <Ionicons
            name={categoryIcons[announcement.category] as any || "information-circle-outline"}
            size={14}
            color={catColor}
          />
          <Text style={[styles.categoryText, { color: catColor }]}>{announcement.category}</Text>
        </View>

        <Text style={styles.title}>{announcement.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>{announcement.createdBy}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>{timeAgo(announcement.createdAt)}</Text>
          </View>
        </View>

        {announcement.imageUrl ? (
          <Image
            source={{ uri: announcement.imageUrl }}
            style={styles.announcementImage}
            contentFit="cover"
          />
        ) : null}

        <View style={styles.contentCard}>
          <Text style={styles.bodyText}>{announcement.description}</Text>
        </View>

        <View style={styles.detailBox}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
            <View>
              <Text style={styles.detailLabel}>Date Posted</Text>
              <Text style={styles.detailValue}>{formatDate(announcement.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Ionicons name="person-circle-outline" size={16} color={Colors.textSecondary} />
            <View>
              <Text style={styles.detailLabel}>Posted By</Text>
              <Text style={styles.detailValue}>{announcement.createdBy}</Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Ionicons name={categoryIcons[announcement.category] as any || "tag-outline"} size={16} color={Colors.textSecondary} />
            <View>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={[styles.detailValue, { color: catColor, fontFamily: "Poppins_600SemiBold" }]}>
                {announcement.category}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgCream,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.bgCream,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: Colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  categoryText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: Colors.textPrimary,
    lineHeight: 34,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: Colors.textLight,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  announcementImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: Colors.border,
  },
  contentCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  bodyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  detailBox: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 0,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  detailLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: Colors.textPrimary,
  },
  notFound: {
    flex: 1,
    backgroundColor: Colors.bgCream,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  notFoundText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  backBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: Colors.white,
  },
});
