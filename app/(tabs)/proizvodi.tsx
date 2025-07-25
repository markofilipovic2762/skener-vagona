import { posaljiUBarzu } from "@/api/api";
import { useToken } from "@/hooks/useToken";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
export default function Barza() {
  const navigation = useNavigation();
  const [scannerValue, setScannerValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    body: "",
    type: "SUCCESS",
  });
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;

  const { userAd } = useToken();

  const scannerInputRef = useRef<TextInput>(null);

  const showCustomAlert = (
    title: string,
    body: string,
    type: "SUCCESS" | "DANGER"
  ) => {
    setAlertMessage({ title, body, type });
    setAlertVisible(true);
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      RNAnimated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setAlertVisible(false));
    }, 2000);
  };

  useEffect(() => {
    if (scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  }, []);

  const handleScan = async () => {
    if (!scannerValue.trim()) return;

    setLoading(true);
    try {
      const response = await posaljiUBarzu(scannerValue.trim(), userAd);

      console.log(response);

      if (response.status === "uspeh") {
        // Dialog.show({
        //   type: ALERT_TYPE.SUCCESS,
        //   title: "Uspesno",
        //   textBody: `Poslali ste proizvod ${response.kluc} u barzu!`,
        //   button: "Ok",
        // });
        showCustomAlert("Uspeh", "Poslali ste proizvod u baržu!", "SUCCESS");

        setScannerValue("");
      }
      if (response.detail) {
        // Dialog.show({
        //   type: ALERT_TYPE.WARNING,
        //   title: "Upozorenje",
        //   textBody: `Proizvod nije na listi sa greskom!`,
        //   autoClose: 2000,
        // });
        showCustomAlert("Upozorenje", "Proizvod nije pronadjen!", "DANGER");

        console.log(response.detail);

        setScannerValue("");
      }
    } catch (error: any) {
      // Toast.show({
      //   type: ALERT_TYPE.DANGER,
      //   title: "Greška",
      //   textBody: error.response.detail || "Došlo je do greške prilikom slanja",
      //   autoClose: 3000,
      // });
      showCustomAlert(
        "FATALNA GRESKA",
        "Dogodila se greska na serveru",
        "DANGER"
      );
    } finally {
      setLoading(false);
      setTimeout(() => scannerInputRef.current?.focus(), 100);
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(500)}
      exiting={FadeInDown.duration(500)}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Oštećeni proizvodi</Text>
            <View style={{ width: 24 }} />
          </View>

          {alertVisible && (
            <Animated.View
              style={[
                styles.alertContainer,
                alertMessage.type === "SUCCESS"
                  ? styles.successFeedback
                  : styles.errorFeedback,
                { opacity: fadeAnim },
              ]}
            >
              <Ionicons
                name={
                  alertMessage.type === "SUCCESS"
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={20}
                color={alertMessage.type === "SUCCESS" ? "#10B981" : "#EF4444"}
              />
              <View style={styles.alertTextContainer}>
                <Text style={styles.alertTitle}>{alertMessage.title}</Text>
                <Text style={styles.alertBody}>{alertMessage.body}</Text>
              </View>
            </Animated.View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <Text style={styles.centerText}>
                SKENIRAJ DA POŠALJEŠ U BARŽU!
              </Text>
              <View style={styles.scannerInputContainer}>
                <TextInput
                  ref={scannerInputRef}
                  style={styles.hiddenInput}
                  value={scannerValue}
                  onChangeText={setScannerValue}
                  onSubmitEditing={handleScan}
                  returnKeyType="done"
                  showSoftInputOnFocus={false}
                  editable={true}
                  autoFocus
                  onBlur={() => {
                    setTimeout(() => scannerInputRef.current?.focus(), 100);
                  }}
                />
                <View style={styles.scannerVisual}>
                  <Ionicons name="barcode" size={32} color="#4A90E2" />
                  <Text style={styles.scannerHint}>
                    Skenirajte bar-kod proizvoda
                  </Text>
                </View>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1E293B",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#1E293B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#4A90E2",
    padding: 10,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#afaf3f",
    textAlign: "auto",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8f9f9",
    marginBottom: 24,
    textAlign: "center",
  },
  scannerInputContainer: {
    backgroundColor: "#D9F99D",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hiddenInput: {
    height: 0,
    opacity: 0,
  },
  scannerVisual: {
    alignItems: "center",
  },
  scannerHint: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  alertContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertTextContainer: {
    marginLeft: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  alertBody: {
    fontSize: 14,
    color: "#1F2937",
  },
  successFeedback: {
    backgroundColor: "#ECFDF5",
  },
  warningFeedback: {
    backgroundColor: "#FFFBEB",
  },
  errorFeedback: {
    backgroundColor: "#FEF2F2",
  },
});
