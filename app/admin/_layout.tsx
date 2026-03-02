import { Stack } from "expo-router";
import { Colors } from "@/constants/colors";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bgCream },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
      <Stack.Screen name="manage" />
      <Stack.Screen name="edit/[id]" />
    </Stack>
  );
}
