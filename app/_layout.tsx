import { useColorScheme } from "@/hooks/useColorScheme";
import NetInfo from "@react-native-community/netinfo";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import AuthProvider, { useAuth } from "./AuthContext";
import { StateProvider } from "./VagonContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/Poppins-Regular.ttf"),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Check network status
  useEffect(() => {
    const checkNetwork = async () => {
      const state = await NetInfo.fetch();
      setIsConnected(
        state.isConnected && state.type === "wifi"
        // state.details.ssid == "secure"
      );
      setIsLoading(false);
    };

    checkNetwork();

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected && state.type === "wifi");
    });

    return () => unsubscribe();
  }, []);

  if (!loaded || isLoading || isConnected === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F5F7FA",
        }}
      >
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!isConnected) {
    return (
      <Stack>
        <Stack.Screen name="no-network" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StateProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="scan" options={{ headerShown: false }} />
          <Stack.Screen name="scan-barza" options={{ headerShown: false }} />

          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="no-network" />
        </Stack>
        <StatusBar style="auto" />
        </StateProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
