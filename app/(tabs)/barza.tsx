import { getKompozicije } from "@/api/api";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../AuthContext";

export default function BarzaScreen() {
  const { userToken, setUserToken } = useAuth();
  const router = useRouter();
  const [brojUtovara, setBrojUtovara] = useState<string[]>([]);
  const [selectedBrojUtovara, setSelectedBrojUtovara] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userToken) {
      router.replace("/login");
    }
  }, [userToken]);

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

  const handleContinue = () => {
    if (selectedBrojUtovara) {
      router.push({
        pathname: "/scan",
        params: {
          bu: selectedBrojUtovara,
        },
      });
    }
  };

  return (
    <SafeAreaView style={homeStyles.safeArea}>
      <View style={homeStyles.container}>
        <View style={homeStyles.header}>
          <Text style={homeStyles.title}>Skenerija baržu</Text>
        </View>

        {loading ? (
          <View style={homeStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : (
          <>
            <View style={homeStyles.inputContainer}>
              <Text style={homeStyles.label}>Broj Utovara</Text>
              <View style={homeStyles.pickerContainer}>
                <Picker
                  selectedValue={selectedBrojUtovara}
                  onValueChange={(value) => setSelectedBrojUtovara(value)}
                  style={homeStyles.picker}
                  dropdownIconColor="#666"
                >
                  <Picker.Item
                    label="Selektuj Broj Utovara"
                    value=""
                    style={homeStyles.pickerItem}
                  />
                  {brojUtovara?.map((val) => (
                    <Picker.Item
                      key={val}
                      label={val}
                      value={val}
                      style={homeStyles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            

            {selectedBrojUtovara && (
              <TouchableOpacity
                style={homeStyles.continueButton}
                onPress={handleContinue}
              >
                <Text style={homeStyles.continueButtonText}>Nastavi</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const homeStyles = StyleSheet.create({
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#afaf3f",
    textAlign: "center",
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
  continueButton: {
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
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});
