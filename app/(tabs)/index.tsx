import { getVagoni } from "@/api/api";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../AuthContext";
import { useVagonState } from "../VagonContext";

export default function HomeScreen() {
  // const { isAuthenticated } = useAuth();
  const { vagoni, setVagoni } = useVagonState();
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const navigation = useNavigation();

  const [selectedVagon, setSelectedVagon] = useState("");
  const [loading, setLoading] = useState(false);
  const [grupa, setGrupa] = useState("");

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.replace("/login");
  //   }
  // }, []);

  useEffect(() => {
    if (selectedVagon) {
      const found = vagoni.find((v) => v.regis === selectedVagon);
      setGrupa(String(found?.grupa));
    }
  }, [selectedVagon]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVagoni();
    setRefreshing(false);
  };

  const fetchVagoni = async () => {
    setLoading(true);
    try {
      const vagoni = await getVagoni();
      setVagoni(vagoni);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVagoni();
    }, [])
  );

  const handleContinue = () => {
    if (selectedVagon) {
      router.push({
        pathname: "/scan",
        params: {
          vagon: selectedVagon,
          grupa,
        },
      });
    }
  };

  return (
    <SafeAreaView style={homeStyles.safeArea}>
      <ScrollView
        style={homeStyles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={homeStyles.header}>
          <Text style={homeStyles.title}>Skener vagona</Text>
        </View>

        {loading ? (
          <View style={homeStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : vagoni.length === 0 ? (
          <View>
            <Text style={{ color: "white", fontSize: 24 }}>
              Nema vagona za skeniranje
            </Text>
          </View>
        ) : (
          <>
            <View style={homeStyles.inputContainer}>
              <Text style={homeStyles.label}>Vagon</Text>
              <View style={homeStyles.pickerContainer}>
                <Picker
                  selectedValue={selectedVagon}
                  onValueChange={setSelectedVagon}
                  style={homeStyles.picker}
                  dropdownIconColor="#666"
                >
                  <Picker.Item
                    label="Selektuj vagon"
                    value=""
                    style={homeStyles.pickerItem}
                  />
                  {vagoni?.map((val) => (
                    <Picker.Item
                      key={val.regis}
                      label={val.regis}
                      value={val.regis}
                      style={homeStyles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {selectedVagon && (
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
      </ScrollView>
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
    height: 60,
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
