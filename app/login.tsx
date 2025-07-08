import { login } from "@/api/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Greška", "Unesite korisničko ime i lozinku");
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(username, password);

      if (response.accessToken) {
        await AsyncStorage.setItem("userToken", response.accessToken);
        router.push("/");
      } else {
        Alert.alert("Greska", response.detail);
      }
    } catch (error) {
      console.error("Login error", error);
      Alert.alert("Greška", "Neuspelo prijavljivanje");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <View style={authStyles.container}>
        <View style={authStyles.logoContainer}>
          <Ionicons name="train" size={60} color="#4A90E2" />
          <Text style={authStyles.logoText}>Skener Vagona</Text>
        </View>

        <View style={authStyles.formContainer}>
          <Text style={authStyles.label}>Korisničko ime</Text>
          <TextInput
            style={authStyles.input}
            placeholder="Unesite korisničko ime"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={authStyles.label}>Lozinka</Text>
          <TextInput
            style={authStyles.input}
            placeholder="Unesite lozinku"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={authStyles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={authStyles.loginButtonText}>Prijavi se</Text>
                <Ionicons name="log-in" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={authStyles.footer}>
          <Text style={authStyles.footerText}>
            © 2025 Skener Vagona App. Kancelarija za razvoj aplikacija HBIS.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const authStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1E293B",
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#1E293B",
    justifyContent: "space-between",
  },

  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
  },
  formContainer: {
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#d1d5db",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loginButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
  },
});
