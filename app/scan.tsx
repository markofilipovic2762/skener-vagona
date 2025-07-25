import {
  getGreske,
  getProizvodi,
  posaljiGresku,
  posaljiProizvode,
} from "@/api/api";
import { useToken } from "@/hooks/useToken";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ScanScreen() {
  const { userAd } = useToken();
  const navigation = useNavigation();
  const router = useRouter();
  const { vagon, grupa } = useLocalSearchParams<{
    vagon: string;
    grupa: string;
  }>();
  const [productList, setProductList] = useState<string[]>([]);
  const [scannerValue, setScannerValue] = useState("");
  const [scanFeedback, setScanFeedback] = useState("");
  const [scannedProducts, setScannedProducts] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [damagedProducts, setDamagedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [greske, setGreske] = useState([]);
  const [selectedGrupa, setSelectedGrupa] = useState("");
  const [filteredGreske, setFilteredGreske] = useState([]);
  const [selectedOpis, setSelectedOpis] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    body: "",
    type: "SUCCESS",
  });
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setAlertVisible(false));
    }, 3000);
  };

  const scannerInputRef = useRef<TextInput>(null);

  const sveGrupe = [...new Set(greske?.map((g: any) => g.opis))];

  useEffect(() => {
    const fetchProizvodi = async () => {
      if (vagon) {
        setLoading(true);
        try {
          const proizvodi = await getProizvodi(vagon);
          setProductList(proizvodi);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProizvodi();
  }, [vagon]);

  useEffect(() => {
    if (productList?.length > 0 && scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  }, [productList]);

  useEffect(() => {
    if (modalVisible) {
      fetchGreske();
    }
  }, [modalVisible]);

  const fetchGreske = async () => {
    try {
      const res = await getGreske();
      setGreske(res.greske);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedGrupa) {
      const filtered = greske?.filter((g: any) => g.opis === selectedGrupa);
      setFilteredGreske(filtered);
      setSelectedOpis("");
    }
  }, [selectedGrupa, greske]);

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
      await posaljiProizvode(scannedProducts, userAd, vagon);
      showCustomAlert(
        "Uspešno poslato",
        `Ukupno skeniranih proizvoda: ${scannedProducts?.length}`,
        "SUCCESS"
      );
      setShouldNavigate(true);
    } catch (error: any) {
      console.error("Greška pri slanju proizvoda:", error);
      showCustomAlert(
        "Neuspeh",
        "Dogodila se greska pri slanju proizvoda!",
        "DANGER"
      );
    }
  };

  const remainingCount = productList?.length - scannedProducts?.length;

  return (
    <SafeAreaView style={scanStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={scanStyles.container}
      >
        <View style={scanStyles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={scanStyles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={scanStyles.title}>{vagon}</Text>
          <View style={{ width: 24 }} />
        </View>

        {alertVisible && (
          <Animated.View
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
              color={alertMessage.type === "SUCCESS" ? "#10B981" : "#EF4444"}
            />
            <View style={scanStyles.alertTextContainer}>
              <Text style={scanStyles.alertTitle}>{alertMessage.title}</Text>
              <Text style={scanStyles.alertBody}>{alertMessage.body}</Text>
            </View>
          </Animated.View>
        )}

        {loading ? (
          <View style={scanStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : (
          <>
            {productList?.length > 0 && (
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
                    const isDamaged = damagedProducts.includes(p);
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          scanStyles.card,
                          isScanned && scanStyles.scannedCard,
                          isDamaged && scanStyles.damagedCard,
                        ]}
                        onLongPress={() => {
                          setSelectedProduct(p);
                          setModalVisible(true);
                        }}
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
                        {isDamaged && (
                          <View style={scanStyles.statusIcon}>
                            <Ionicons
                              name="alert-circle"
                              size={24}
                              color="#EF4444"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
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
                    <Text style={scanStyles.feedbackText}>{scanFeedback}</Text>
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
                        setTimeout(() => scannerInputRef.current?.focus(), 100);
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

            {scannedProducts?.length + damagedProducts?.length >=
              productList?.length && (
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

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={scanStyles.modalOverlay}>
            <View style={scanStyles.modalContent}>
              <Text style={scanStyles.modalTitle}>Obeleži kao oštećen</Text>
              <Text style={scanStyles.modalProductName}>{selectedProduct}</Text>

              <View style={scanStyles.dropdownContainer}>
                <Text style={scanStyles.label}>Grupa greške</Text>
                <Picker
                  selectedValue={selectedGrupa}
                  onValueChange={(itemValue) => setSelectedGrupa(itemValue)}
                >
                  <Picker.Item label="Izaberi grupu" value="" />
                  {sveGrupe?.map((grupa) => (
                    <Picker.Item key={grupa} label={grupa} value={grupa} />
                  ))}
                </Picker>

                {selectedGrupa !== "" && (
                  <>
                    <Text style={scanStyles.label}>Opis greške</Text>
                    <Picker
                      selectedValue={selectedOpis}
                      onValueChange={(itemValue) => setSelectedOpis(itemValue)}
                    >
                      <Picker.Item label="Izaberi opis" value="" />
                      {filteredGreske?.map((g: any, idx) => (
                        <Picker.Item
                          key={idx}
                          label={g.sifra}
                          value={g.sifra}
                        />
                      ))}
                    </Picker>
                  </>
                )}
              </View>

              <View style={scanStyles.modalButtons}>
                <TouchableOpacity
                  style={[scanStyles.modalButton, scanStyles.damageButton]}
                  onPress={async () => {
                    if (selectedProduct && selectedOpis) {
                      const greskaObj = {
                        kluc: selectedProduct,
                        regis: vagon,
                        grupa: Number(grupa),
                        napomena: selectedOpis,
                        kontrolor: userAd,
                      };
                      try {
                        await posaljiGresku(
                          greskaObj.kluc,
                          greskaObj.regis,
                          greskaObj.grupa,
                          greskaObj.napomena,
                          greskaObj.kontrolor
                        );
                        showCustomAlert(
                          "USPEH",
                          `Poslat oštećen proizvod: ${greskaObj.kluc}`,
                          "SUCCESS"
                        );
                        setDamagedProducts((prev: any) => [
                          ...prev,
                          greskaObj.kluc,
                        ]);
                        setSelectedGrupa("");
                        setSelectedOpis("");
                        setSelectedProduct("");
                      } catch (error) {
                        alert(error);
                      }
                    }
                    setModalVisible(false);
                  }}
                >
                  <Ionicons name="alert-circle" size={20} color="#fff" />
                  <Text style={scanStyles.modalButtonText}>Oštećen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[scanStyles.modalButton, scanStyles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={scanStyles.modalButtonText}>Otkaži</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    marginBottom: 25,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#afaf3f",
    textAlign: "center",
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
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 4,
  },
  productInfoRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  productInfoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 4,
    fontWeight: "600",
  },
  productInfo: {
    fontSize: 12,
    color: "#6B7280",
  },
  scannedCard: {
    backgroundColor: "#ECFDF5",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  damagedCard: {
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
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
  scannerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
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
    //marginBottom: 25,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalProductName: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#444",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 5,
  },
  damageButton: {
    backgroundColor: "#d9534f",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  modalButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  dropdownContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: "#333",
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
