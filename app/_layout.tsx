import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AuthProvider, { useAuth } from "./AuthContext";

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
      setIsConnected(state.isConnected && state.type === "wifi" && state.details.ssid == "secure");
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

  const { userToken } = useAuth();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {userToken ? (
            <>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="scan" options={{ headerShown: false }} />
            </>
          ) : (
            <Stack.Screen name="login" options={{ headerShown: false }} />
          )}
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="no-network" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
