import { getKompozicije, getProizvodi, getVagoni } from "@/api/api";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

type Product = {
  id: string;
  name: string;
  code: string;
};

export default function HomeScreen() {
  const [brojUtovara, setBrojUtovara] = useState<string[]>([]);
  const [selectedBrojUtovara, setSelectedBrojUtovara] = useState<string>("");
  const [grupa, setGrupa] = useState("");
  const [vagoni, setVagoni] = useState([]);
  const [selectedVagon, setSelectedVagon] = useState("");
  const [productList, setProductList] = useState<string[]>([]);
  const [scannerValue, setScannerValue] = useState("");
  const [scanFeedback, setScanFeedback] = useState("");
  const [removedProducts, setRemovedProducts] = useState<string[]>([]);
  const [scannedProducts, setScannedProducts] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [damagedProducts, setDamagedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const scannerInputRef = useRef<TextInput>(null);

  const handleReset = () => {
    setSelectedBrojUtovara("");
    setGrupa("");
    setVagoni([]);
    setSelectedVagon("");
    setProductList([]);
    setScannerValue("");
    setScanFeedback("");
    setRemovedProducts([]);
    setScannedProducts([]);
    setDamagedProducts([]);
    setSelectedProduct("");
    setModalVisible(false);
    if (scannerInputRef.current) {
      scannerInputRef.current.clear();
      setTimeout(() => scannerInputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    const fetchBrojUtovara = async () => {
      setLoading(true);
      try {
        const brojUtovaraFetch = await getKompozicije();
        setBrojUtovara(brojUtovaraFetch);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrojUtovara();
  }, []);

  useEffect(() => {
    const fetchVagoni = async () => {
      if (selectedBrojUtovara) {
        setLoading(true);
        try {
          const vagoni = await getVagoni(selectedBrojUtovara);
          setVagoni(vagoni);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchVagoni();
  }, [selectedBrojUtovara]);

  useEffect(() => {
    const fetchProizvodi = async () => {
      if (selectedVagon) {
        setLoading(true);
        try {
          const proizvodi = await getProizvodi(selectedVagon);
          setProductList(proizvodi);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProizvodi();
  }, [selectedVagon]);

  useEffect(() => {
    if (productList?.length > 0 && scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  }, [productList]);

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

  const remainingCount = productList?.length - scannedProducts?.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Skener vagona</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : (
          <>
            {/* Dropdown 1 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Broj Utovara</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedBrojUtovara}
                  onValueChange={(value) => setSelectedBrojUtovara(value)}
                  style={styles.picker}
                  dropdownIconColor="#666"
                >
                  <Picker.Item
                    label="Selektuj Broj Utovara"
                    value=""
                    style={styles.pickerItem}
                  />
                  {brojUtovara?.map((val) => (
                    <Picker.Item
                      key={val}
                      label={val}
                      value={val}
                      style={styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Dropdown 3 */}
            {selectedBrojUtovara && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Vagon</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedVagon}
                    onValueChange={setSelectedVagon}
                    style={styles.picker}
                    dropdownIconColor="#666"
                    enabled={!!selectedBrojUtovara}
                  >
                    <Picker.Item
                      label="Selektuj vagon"
                      value=""
                      style={styles.pickerItem}
                    />
                    {vagoni?.map((val) => (
                      <Picker.Item
                        key={val}
                        label={val}
                        value={val}
                        style={styles.pickerItem}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Products */}
            {productList?.length > 0 && (
              <View style={styles.productsContainer}>
                <View style={styles.productsHeader}>
                  <Text style={styles.subtitle}>Proizvodi</Text>
                  <View style={styles.counterBadge}>
                    <Text style={styles.counterText}>
                      {remainingCount} / {productList?.length} ostalo
                    </Text>
                  </View>
                </View>

                <ScrollView
                  style={styles.productsScroll}
                  contentContainerStyle={styles.productsScrollContent}
                >
                  {productList.map((p, index) => {
                    const isScanned = scannedProducts.includes(p);
                    const isDamaged = damagedProducts.includes(p);
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.card,
                          isScanned && styles.scannedCard,
                          isDamaged && styles.damagedCard,
                        ]}
                        onLongPress={() => {
                          setSelectedProduct(p);
                          setModalVisible(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={styles.cardContent}>
                          <Text style={styles.productName}>{p}</Text>
                          <View style={styles.productInfoRow}>
                            <Text style={styles.productInfoLabel}>Code:</Text>
                            <Text style={styles.productInfo}>{p}</Text>
                          </View>
                          <View style={styles.productInfoRow}>
                            <Text style={styles.productInfoLabel}>ID:</Text>
                            <Text style={styles.productInfo}>{p}</Text>
                          </View>
                        </View>
                        {isScanned && (
                          <View style={styles.statusIcon}>
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color="#10B981"
                            />
                          </View>
                        )}
                        {isDamaged && (
                          <View style={styles.statusIcon}>
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

            {/* Scanner input */}
            {productList?.length > 0 && (
              <View style={styles.scannerContainer}>
                {scanFeedback !== "" && (
                  <View
                    style={[
                      styles.feedbackContainer,
                      scanFeedback.includes("✅")
                        ? styles.successFeedback
                        : scanFeedback.includes("⚠️")
                        ? styles.warningFeedback
                        : styles.errorFeedback,
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
                    <Text style={styles.feedbackText}>{scanFeedback}</Text>
                  </View>
                )}
                {scannedProducts?.length != productList?.length && (
                  <View style={styles.scannerInputContainer}>
                    {/* <Text style={styles.scannerLabel}>Skeniraj proizvod...</Text> */}
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
                        Skenirajte barkodove proizvoda
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {scannedProducts?.length === productList?.length &&
              productList.length > 0 && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => {
                    alert(`Poslato! Oštećeni: ${damagedProducts.length}`);
                  }}
                >
                  <Text style={styles.submitButtonText}>Pošalji</Text>
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Obeleži proizvod</Text>
              <Text style={styles.modalProductName}>{selectedProduct}</Text>
              <Text style={styles.modalProductCode}>{selectedProduct}</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.damageButton]}
                  onPress={() => {
                    if (selectedProduct) {
                      setDamagedProducts((prev) => [...prev, selectedProduct]);
                    }
                    setModalVisible(false);
                  }}
                >
                  <Ionicons name="alert-circle" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>Oštećen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Otkaži</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#1E293B", //"#F5F7FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#afaf3f",
    textAlign: "center",
    marginLeft: 60
  },
  resetButton: {
    backgroundColor: "#4A90E2",
    padding: 10,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#f8f9f9",
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    height: 50,
    color: "#1F2937",
  },
  pickerItem: {
    fontSize: 16,
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
    color: "#1F2937",
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
    //marginBottom: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 4,
  },
  modalProductCode: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  damageButton: {
    backgroundColor: "#EF4444",
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
  },
  modalButtonText: {
    color: "#3F3F3F",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});
