import { Stack } from "expo-router";
import { Colors } from "@/constants/colors";

export default function StudentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bgCream },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="announcement/[id]" />
    </Stack>
  );
}
