import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Announcement } from "@/context/AnnouncementContext";
import { Colors } from "@/constants/colors";

interface Props {
  announcement: Announcement;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const categoryIcons: Record<string, string> = {
  Academic: "school-outline",
  Events: "calendar-outline",
  Emergency: "warning-outline",
  General: "information-circle-outline",
};

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

export default function AnnouncementCard({ announcement, onPress, onEdit, onDelete, showActions }: Props) {
  const catColor = Colors.categories[announcement.category] || Colors.primary;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={[styles.categoryStripe, { backgroundColor: catColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.categoryBadge, { backgroundColor: catColor + "18", borderColor: catColor + "40" }]}>
            <Ionicons
              name={categoryIcons[announcement.category] as any || "information-circle-outline"}
              size={12}
              color={catColor}
            />
            <Text style={[styles.categoryText, { color: catColor }]}>{announcement.category}</Text>
          </View>
          <Text style={styles.timeText}>{timeAgo(announcement.createdAt)}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>{announcement.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{announcement.description}</Text>

        <View style={styles.bottomRow}>
          <View style={styles.authorRow}>
            <Ionicons name="person-circle-outline" size={14} color={Colors.textLight} />
            <Text style={styles.authorText}>{announcement.createdBy}</Text>
          </View>
          {showActions && (
            <View style={styles.actions}>
              {onEdit && (
                <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
                  <Ionicons name="pencil-outline" size={16} color={Colors.info} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
                  <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          )}
          {!showActions && (
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryStripe: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  timeText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: Colors.textLight,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  description: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  authorText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: Colors.textLight,
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#EBF5FB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#AED6F1",
  },
  deleteBtn: {
    backgroundColor: "#FDECEA",
    borderColor: "#F5C6C3",
  },
});
