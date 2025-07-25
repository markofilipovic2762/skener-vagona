import { getBarzaProizvodi, posaljiBarzaProizvode } from "@/api/api";
import { useToken } from "@/hooks/useToken";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Animated as RNAnimated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

export default function Barza() {
  const navigation = useNavigation();
  const router = useRouter();
  const [productList, setProductList] = useState<string[]>([]);
  const [scannerValue, setScannerValue] = useState("");
  const [scanFeedback, setScanFeedback] = useState("");
  const [scannedProducts, setScannedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    body: "",
    type: "SUCCESS" as "SUCCESS" | "DANGER",
  });
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;

  const { userAd, authorized, checkToken } = useToken();
  const scannerInputRef = useRef<TextInput>(null);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (authorized === false) {
      router.replace("/login");
    }
  }, [authorized, router]);

  const fetchingProizvodi = useCallback(async () => {
    fetchProizvodi();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchingProizvodi();
    setRefreshing(false);
  };

  const fetchProizvodi = async () => {
    setLoading(true);
    try {
      const proizvodi = await getBarzaProizvodi();
      setProductList(proizvodi);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkToken();
      fetchProizvodi();
    }, [])
  );

  useEffect(() => {
    if (productList?.length > 0 && scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  }, [productList]);

  useEffect(() => {
    if (shouldNavigate) {
      const timer = setTimeout(() => {
        setScannedProducts([]);
        setProductList([]);
        router.push("/");
        setShouldNavigate(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [shouldNavigate, router]);

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
    }, 3000);
  };

  const handleScan = () => {
    const scannedCode = scannerValue.trim();
    const product = productList.find(
      (p) =>
        p.toLowerCase() === scannedCode.toLowerCase() ||
        p.toLowerCase() === scannedCode.toLowerCase()
    );

    if (product) {
      if (!scannedProducts.includes(product)) {
        setScannedProducts((prev) => [...prev, product]);
        setScanFeedback(`✅ Skeniran: ${product}`);
      } else {
        setScanFeedback(`⚠️ Već skeniran: ${product}`);
      }
    } else {
      setScanFeedback(`❌ Proizvod nije pronađen: ${scannedCode}`);
    }

    setScannerValue("");
    setTimeout(() => setScanFeedback(""), 3000);

    if (scannerInputRef.current) {
      setTimeout(() => scannerInputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = async () => {
    try {
      await posaljiBarzaProizvode(scannedProducts, userAd);
      showCustomAlert(
        "Uspešno poslato",
        `Ukupno skeniranih proizvoda: ${scannedProducts?.length}`,
        "SUCCESS"
      );
      setShouldNavigate(true);
    } catch (error: any) {
      console.error("Greška pri slanju proizvoda:", error);
      showCustomAlert(
        "Greška",
        `Došlo je do greške prilikom slanja proizvoda: ${error.message}`,
        "DANGER"
      );
    }
  };

  const remainingCount = productList?.length - scannedProducts?.length;

  return (
    <Animated.View
      entering={FadeInRight.duration(500)}
      exiting={FadeOutLeft.duration(500)}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={scanStyles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={scanStyles.container}
        >
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={scanStyles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={scanStyles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={scanStyles.title}>Skeniranje barže</Text>
              <View style={{ width: 24 }} />
            </View>

            {alertVisible && (
              <RNAnimated.View
                style={[
                  scanStyles.alertContainer,
                  alertMessage.type === "SUCCESS"
                    ? scanStyles.successFeedback
                    : scanStyles.errorFeedback,
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
                  color={
                    alertMessage.type === "SUCCESS" ? "#10B981" : "#EF4444"
                  }
                />
                <View style={scanStyles.alertTextContainer}>
                  <Text style={scanStyles.alertTitle}>
                    {alertMessage.title}
                  </Text>
                  <Text style={scanStyles.alertBody}>{alertMessage.body}</Text>
                </View>
              </RNAnimated.View>
            )}

            {loading ? (
              <View style={scanStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
              </View>
            ) : (
              <>
                {productList?.length > 0 ? (
                  <View style={scanStyles.productsContainer}>
                    <View style={scanStyles.productsHeader}>
                      <Text style={scanStyles.subtitle}>Proizvodi</Text>
                      <View style={scanStyles.counterBadge}>
                        <Text style={scanStyles.counterText}>
                          {remainingCount} / {productList?.length} ostalo
                        </Text>
                      </View>
                    </View>

                    <ScrollView
                      style={scanStyles.productsScroll}
                      contentContainerStyle={scanStyles.productsScrollContent}
                    >
                      {productList?.map((p, index) => {
                        const isScanned = scannedProducts.includes(p);
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              scanStyles.card,
                              isScanned && scanStyles.scannedCard,
                            ]}
                            activeOpacity={0.8}
                          >
                            <View style={scanStyles.cardContent}>
                              <Text style={scanStyles.productName}>{p}</Text>
                            </View>
                            {isScanned && (
                              <View style={scanStyles.statusIcon}>
                                <Ionicons
                                  name="checkmark-circle"
                                  size={24}
                                  color="#10B981"
                                />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : (
                  <View>
                    <Text style={{ color: "white", fontSize: 24 }}>
                      Nema proizvoda za skeniranje
                    </Text>
                  </View>
                )}

                {productList?.length > 0 && (
                  <View style={scanStyles.scannerContainer}>
                    {scanFeedback !== "" && (
                      <View
                        style={[
                          scanStyles.feedbackContainer,
                          scanFeedback.includes("✅")
                            ? scanStyles.successFeedback
                            : scanFeedback.includes("⚠️")
                            ? scanStyles.warningFeedback
                            : scanStyles.errorFeedback,
                        ]}
                      >
                        <Ionicons
                          name={
                            scanFeedback.includes("✅")
                              ? "checkmark-circle"
                              : scanFeedback.includes("⚠️")
                              ? "warning"
                              : "close-circle"
                          }
                          size={20}
                          color={
                            scanFeedback.includes("✅")
                              ? "#10B981"
                              : scanFeedback.includes("⚠️")
                              ? "#F59E0B"
                              : "#EF4444"
                          }
                        />
                        <Text style={scanStyles.feedbackText}>
                          {scanFeedback}
                        </Text>
                      </View>
                    )}
                    {scannedProducts?.length !== productList?.length && (
                      <View style={scanStyles.scannerInputContainer}>
                        <TextInput
                          ref={scannerInputRef}
                          style={scanStyles.hiddenInput}
                          value={scannerValue}
                          onChangeText={setScannerValue}
                          onSubmitEditing={handleScan}
                          returnKeyType="done"
                          showSoftInputOnFocus={false}
                          editable={true}
                          autoFocus
                          onBlur={() => {
                            setTimeout(
                              () => scannerInputRef.current?.focus(),
                              100
                            );
                          }}
                        />

                        <View style={scanStyles.scannerVisual}>
                          <Ionicons name="barcode" size={32} color="#4A90E2" />
                          <Text style={scanStyles.scannerHint}>
                            Skenirajte barkodove proizvoda
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {scannedProducts?.length > 0 && (
                  <TouchableOpacity
                    style={scanStyles.submitButton}
                    onPress={handleSubmit}
                  >
                    <Text style={scanStyles.submitButtonText}>Pošalji</Text>
                    <Ionicons name="send" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
}

const scanStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1E293B",
  },
  container: {
    flex: 1,
    padding: 16,
    marginTop: 10,
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
  productsContainer: {
    flex: 1,
    marginTop: 8,
  },
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f8f9f9",
  },
  counterBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  productsScroll: {
    flex: 1,
  },
  productsScrollContent: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flex: 1,
  },
  productName: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 4,
  },
  scannedCard: {
    backgroundColor: "#ECFDF5",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  statusIcon: {
    marginLeft: 8,
  },
  scannerContainer: {
    marginTop: 16,
  },
  feedbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
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
  feedbackText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  scannerInputContainer: {
    backgroundColor: "#D9F99D",
    borderRadius: 12,
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
    marginTop: 1,
    fontSize: 12,
    color: "#6B7280",
  },
  submitButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
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
});
