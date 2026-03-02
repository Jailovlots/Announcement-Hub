import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useAnnouncements, Category } from "@/context/AnnouncementContext";
import { Colors } from "@/constants/colors";

const CATEGORIES: Category[] = ["Academic", "Events", "Emergency", "General"];

const categoryColors: Record<string, string> = {
  Academic: Colors.info,
  Events: Colors.success,
  Emergency: Colors.danger,
  General: "#8E44AD",
};

export default function EditAnnouncementScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { announcements, updateAnnouncement } = useAnnouncements();
  const announcement = announcements.find((a) => a.id === id);

  const [title, setTitle] = useState(announcement?.title || "");
  const [description, setDescription] = useState(announcement?.description || "");
  const [category, setCategory] = useState<Category>(announcement?.category || "General");
  const [imageUri, setImageUri] = useState<string | undefined>(announcement?.imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!announcement) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Announcement not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, fontFamily: "Poppins_600SemiBold" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant photo library access to upload an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await updateAnnouncement(id, {
        title: title.trim(),
        description: description.trim(),
        category,
        imageUrl: imageUri,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      setError(e.message || "Failed to update announcement.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Announcement</Text>
        <TouchableOpacity
          style={[styles.saveBtn, isLoading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: botPad + 24, gap: 18 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter announcement title..."
            placeholderTextColor={Colors.textLight}
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write the full announcement..."
            placeholderTextColor={Colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              const color = categoryColors[cat];
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    isSelected && { backgroundColor: color, borderColor: color },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategory(cat);
                  }}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={
                      cat === "Academic" ? "school-outline" :
                      cat === "Events" ? "calendar-outline" :
                      cat === "Emergency" ? "warning-outline" :
                      "information-circle-outline"
                    }
                    size={16}
                    color={isSelected ? Colors.white : color}
                  />
                  <Text style={[styles.categoryOptionText, isSelected && { color: Colors.white }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Image (Optional)</Text>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(undefined)}>
                <Ionicons name="close-circle" size={28} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.75}>
              <Ionicons name="image-outline" size={28} color={Colors.textLight} />
              <Text style={styles.imagePickerText}>Tap to upload image</Text>
              <Text style={styles.imagePickerSub}>16:9 ratio recommended</Text>
            </TouchableOpacity>
          )}
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
    paddingBottom: 14,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
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
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
    minWidth: 60,
    alignItems: "center",
  },
  saveBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDECEA",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F5C6C3",
  },
  errorText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: Colors.danger,
    flex: 1,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 140,
    paddingTop: 14,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  categoryOptionText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  imagePicker: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  imagePickerText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  imagePickerSub: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: Colors.textLight,
  },
  imagePreviewContainer: {
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    backgroundColor: Colors.border,
  },
  removeImageBtn: {
    position: "absolute",
    top: 10,
    right: 10,
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
});
