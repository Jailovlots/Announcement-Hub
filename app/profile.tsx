import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/colors";

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { user, updateProfile } = useAuth();

    const [username, setUsername] = useState(user?.username || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSave = async () => {
        setError("");
        setSuccess("");

        if (!username.trim()) {
            setError("Username cannot be empty.");
            return;
        }

        if (newPassword) {
            if (!currentPassword) {
                setError("Current password is required to set a new password.");
                return;
            }
            if (newPassword.length < 6) {
                setError("New password must be at least 6 characters.");
                return;
            }
            if (newPassword !== confirmPassword) {
                setError("New passwords do not match.");
                return;
            }
        }

        setIsLoading(true);
        try {
            const updateData: any = {};

            if (username !== user?.username) {
                updateData.username = username.trim();
            }

            if (newPassword && currentPassword) {
                updateData.currentPassword = currentPassword;
                updateData.newPassword = newPassword;
            }

            if (Object.keys(updateData).length === 0) {
                setError("No changes detected.");
                setIsLoading(false);
                return;
            }

            await updateProfile(updateData);
            setSuccess("Profile updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e: any) {
            setError(e.message || "Failed to update profile.");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: Colors.bgCream }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 20 : insets.top + 10 }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 40 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Update Profile</Text>
                    <Text style={styles.cardSubtitle}>Change your username or password</Text>

                    {error ? (
                        <View style={styles.errorBox}>
                            <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {success ? (
                        <View style={styles.successBox}>
                            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                            <Text style={styles.successText}>{success}</Text>
                        </View>
                    ) : null}

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Username</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Your username"
                                placeholderTextColor={Colors.textLight}
                                value={username}
                                onChangeText={(text) => {
                                    setUsername(text);
                                    setError("");
                                    setSuccess("");
                                }}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    <View style={styles.divider}>
                        <Text style={styles.dividerText}>Change Password (Optional)</Text>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Current Password</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Required if changing password"
                                placeholderTextColor={Colors.textLight}
                                value={currentPassword}
                                onChangeText={(text) => {
                                    setCurrentPassword(text);
                                    setError("");
                                    setSuccess("");
                                }}
                                secureTextEntry={!showCurrentPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeButton}>
                                <Ionicons
                                    name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                                    size={18}
                                    color={Colors.textLight}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Min. 6 characters"
                                placeholderTextColor={Colors.textLight}
                                value={newPassword}
                                onChangeText={(text) => {
                                    setNewPassword(text);
                                    setError("");
                                    setSuccess("");
                                }}
                                secureTextEntry={!showNewPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeButton}>
                                <Ionicons
                                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                                    size={18}
                                    color={Colors.textLight}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Re-enter new password"
                                placeholderTextColor={Colors.textLight}
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    setError("");
                                    setSuccess("");
                                }}
                                secureTextEntry={!showNewPassword}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isLoading}
                        activeOpacity={0.85}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: Colors.bgCream,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    headerTitle: {
        fontFamily: "Poppins_600SemiBold",
        fontSize: 18,
        color: Colors.textPrimary,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        alignItems: "center",
    },
    card: {
        width: "100%",
        backgroundColor: Colors.bgCard,
        borderRadius: 24,
        padding: 28,
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    cardTitle: {
        fontFamily: "Poppins_700Bold",
        fontSize: 22,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontFamily: "Poppins_400Regular",
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 24,
    },
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#FDECEA",
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#F5C6C3",
    },
    errorText: {
        fontFamily: "Poppins_400Regular",
        fontSize: 13,
        color: Colors.danger,
        flex: 1,
    },
    successBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#E2F6CD",
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#B1E488",
    },
    successText: {
        fontFamily: "Poppins_400Regular",
        fontSize: 13,
        color: Colors.success,
        flex: 1,
    },
    fieldContainer: {
        marginBottom: 18,
    },
    label: {
        fontFamily: "Poppins_600SemiBold",
        fontSize: 13,
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.bgInput,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.border,
        paddingHorizontal: 14,
        height: 52,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontFamily: "Poppins_400Regular",
        fontSize: 15,
        color: Colors.textPrimary,
        height: 52,
    },
    eyeButton: {
        padding: 4,
    },
    divider: {
        marginVertical: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    dividerText: {
        fontFamily: "Poppins_600SemiBold",
        fontSize: 14,
        color: Colors.textPrimary,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 14,
        height: 54,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontFamily: "Poppins_700Bold",
        fontSize: 16,
        color: Colors.white,
        letterSpacing: 0.5,
    },
});
