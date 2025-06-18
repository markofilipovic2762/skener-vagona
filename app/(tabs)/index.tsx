import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Product = {
  id: string;
  name: string;
  code: string;
};

const brojUtovaraOptions: Record<string, string[]> = {
  "1": ["G-A", "G-B"],
  "2": ["G-B", "G-C"],
  "3": ["G-D"],
  "4": ["G-E"],
  "5": ["G-A", "G-E"],
};
const grupaOptions: string[] = ["G-A", "G-B", "G-C", "G-D", "G-E"];

const vagonOptions: Record<string, string[]> = {
  "G-A": ["V-101", "V-102"],
  "G-B": ["V-201", "V-202", "V-203"],
  "G-C": ["V-301", "V-401"],
  "G-D": ["V-501"],
  "G-E": ["V-601"],
};

const productsByVagon: Record<string, Product[]> = {
  "V-101": [
    { id: "123456", name: "Proizvod 1", code: "CODE001" },
    { id: "234567", name: "Proizvod 2", code: "CODE002" },
  ],
  "V-102": [
    { id: "P003", name: "Product 3", code: "CODE003" },
    { id: "P004", name: "Product 4", code: "CODE004" },
  ],
  "V-201": [{ id: "P005", name: "Product 5", code: "CODE005" }],
  "V-202": [
    { id: "P006", name: "Product 6", code: "CODE006" },
    { id: "P007", name: "Product 7", code: "CODE007" },
  ],
  "V-203": [{ id: "P008", name: "Product 8", code: "CODE008" }],
  "V-301": [
    { id: "P009", name: "Product 9", code: "CODE009" },
    { id: "P010", name: "Product 10", code: "CODE010" },
  ],
};

export default function HomeScreen() {
  const [brojUtovara, setBrojUtovara] = useState("");
  const [grupa, setGrupa] = useState("");
  const [vagon, setVagon] = useState("");
  const [productList, setProductList] = useState<Product[]>([]);
  const [scannerValue, setScannerValue] = useState("");
  const [scanFeedback, setScanFeedback] = useState("");
  const [removedProducts, setRemovedProducts] = useState<string[]>([]);

  const [scannedProducts, setScannedProducts] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [damagedProducts, setDamagedProducts] = useState<string[]>([]);

  const scannerInputRef = useRef<TextInput>(null);

  const handleReset = () => {
    setBrojUtovara("");
    setGrupa("");
    setVagon("");
    setProductList([]);
    setScannerValue("");
    setScanFeedback("");
    setRemovedProducts([]);
    setScannedProducts([]);
    setDamagedProducts([]);
    setSelectedProduct(null);
    setModalVisible(false);
    if (scannerInputRef.current) {
      scannerInputRef.current.clear();
      setTimeout(() => scannerInputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    setGrupa("");
    setVagon("");
    setProductList([]);
    setRemovedProducts([]);
    setScanFeedback("");
  }, [brojUtovara]);

  useEffect(() => {
    setVagon("");
    setProductList([]);
    setRemovedProducts([]);
    setScanFeedback("");
  }, [grupa]);

  useEffect(() => {
    if (vagon && grupa && vagonOptions[grupa]?.includes(vagon)) {
      setProductList(productsByVagon[vagon] || []);
    } else {
      setProductList([]);
    }
  }, [vagon, grupa]);

  useEffect(() => {
    if (productList.length > 0 && scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  }, [productList]);

  const handleScan = () => {
    const scannedCode = scannerValue.trim();
    const product = productList.find(
      (p) =>
        p.id.toLowerCase() === scannedCode.toLowerCase() ||
        p.code.toLowerCase() === scannedCode.toLowerCase()
    );

    if (product) {
      if (!scannedProducts.includes(product.id)) {
        setScannedProducts((prev) => [...prev, product.id]);
        setScanFeedback(`✅ Skeniran: ${product.name}`);
      } else {
        setScanFeedback(`⚠️ Već skeniran: ${product.name}`);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skener vagona</Text>

      <Button title="Reset" onPress={handleReset} color="#f5503b" />

      {/* Dropdown 1 */}
      <Text style={styles.label}>Broj Utovara</Text>
      <Picker
        selectedValue={brojUtovara}
        onValueChange={(value) => setBrojUtovara(value)}
        style={styles.picker}
      >
        <Picker.Item label="Selektuj Broj Utovara" value="" />
        {Object.keys(brojUtovaraOptions).map((val) => (
          <Picker.Item key={val} label={val} value={val} />
        ))}
      </Picker>

      {/* Dropdown 2 */}
      {brojUtovara ? (
        <>
          <Text style={styles.label}>Grupa</Text>
          <Picker selectedValue={grupa} onValueChange={setGrupa} style={styles.picker}>
            <Picker.Item label="Selektuj grupu" value="" />
            {(brojUtovaraOptions[brojUtovara] || []).map((val) => (
              <Picker.Item key={val} label={val} value={val} />
            ))}
          </Picker>
        </>
      ) : null}

      {/* Dropdown 3 */}
      {grupa && (
        <>
          <Text style={styles.label}>Vagon</Text>
          <Picker selectedValue={vagon} onValueChange={setVagon} style={styles.picker}>
            <Picker.Item label="Selektuj vagon" value="" />
            {(vagonOptions[grupa] || []).map((val) => (
              <Picker.Item key={val} label={val} value={val} />
            ))}
          </Picker>
        </>
      )}

      {/* Products */}
      {productList.length > 0 && (
        <>
          <Text style={styles.subtitle}>
            Proizvodi ({productList.length - scannedProducts.length} preostalo)
          </Text>
          <ScrollView style={{ maxHeight: 250 }}>
            {productList.map((p) => {
              const isScanned = scannedProducts.includes(p.id);
              const isDamaged = damagedProducts.includes(p.id);
              return (
                <View
                  key={p.id}
                  style={[
                    styles.card,
                    isScanned && styles.scannedCard,
                    isDamaged && styles.damagedCard,
                  ]}
                >
                  <Text
                    style={styles.productName}
                    onPress={() => {
                      setSelectedProduct(p);
                      setModalVisible(true);
                    }}
                  >
                    {p.name}
                  </Text>
                  <Text style={styles.productInfo}>Code: {p.code}</Text>
                  <Text style={styles.productInfo}>ID: {p.id}</Text>
                </View>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* Removed products */}
      {removedProducts.length > 0 && (
        <Text style={styles.success}>
          ✅ {removedProducts.length} product
          {removedProducts.length !== 1 ? "s" : ""} removed
        </Text>
      )}

      {/* Scanner input */}
      {productList.length > 0 && (
        <View style={styles.scannerContainer}>
          {scanFeedback !== "" && (
            <Text
              style={[
                styles.feedback,
                scanFeedback.includes("✅") ? styles.success : styles.error,
              ]}
            >
              {scanFeedback}
            </Text>
          )}
          <Text style={styles.label}>Skeniraj sada...</Text>
          <TextInput
            ref={scannerInputRef}
            style={{ height: 0, opacity: 0 }}
            value={scannerValue}
            onChangeText={setScannerValue}
            onSubmitEditing={handleScan}
            returnKeyType="done"
            showSoftInputOnFocus={false}
            editable={true}
            autoFocus
            onBlur={() => {
              // Ako se izgubi fokus, ponovo ga postavi
              setTimeout(() => {
                scannerInputRef.current?.focus();
              }, 100);
            }}
          />
        </View>
      )}
      {scannedProducts.length === productList.length &&
        productList.length > 0 && (
          <Button
            title="Pošalji"
            onPress={() => {
              alert(`Poslato! Oštećeni: ${damagedProducts.length}`);
              // Možeš ovde staviti stvarni submit poziv
            }}
            color="#10b981"
          />
        )}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}
            >
              Obeleži kao oštećen?
            </Text>
            <Text>{selectedProduct?.code}</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <Button
                title="Oštećen"
                onPress={() => {
                  if (selectedProduct) {
                    setDamagedProducts((prev) => [...prev, selectedProduct.id]);
                  }
                  setModalVisible(false);
                }}
                color="#ef4444"
              />
              <View style={{ width: 10 }} />
              <Button title="Otkaži" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#40e6ff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: { marginTop: 12, fontWeight: "600", fontSize: 14 },
  subtitle: { marginTop: 16, fontSize: 16, fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 1,
  },
  productName: { fontWeight: "bold", fontSize: 16 },
  productInfo: { fontSize: 12, color: "#555" },
  input: {
    height: 0,
    opacity: 0,
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
    backgroundColor: "#fff",
  },
  scannerContainer: { marginTop: 20 },
  feedback: {
    padding: 8,
    borderRadius: 6,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  success: { backgroundColor: "#d1fae5", color: "#065f46" },
  error: { backgroundColor: "#fee2e2", color: "#991b1b" },
  scannedCard: {
    backgroundColor: "#d1fae5", // zelena pozadina
  },
  damagedCard: {
    borderColor: "#b91c1c",
    borderWidth: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    minWidth: 250,
  },
  picker: {
    backgroundColor: "#fff",
    color: "#b1b1b1",
    marginTop: 6,
  },
});
