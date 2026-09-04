import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.tint,
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: 56 + bottomPadding, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 0.5 },
    }}>
      <Tabs.Screen name="index" options={{ title: "Lab", tabBarIcon: ({ color }) => <IconSymbol size={28} name="shield.fill" color={color} /> }} />
    </Tabs>
  );
}
