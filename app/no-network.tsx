import { View, Text, StyleSheet, Button } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export default function NoNetworkScreen() {
  const [isChecking, setIsChecking] = useState(false);

  const checkNetwork = async () => {
    setIsChecking(true);
    const state = await NetInfo.fetch();
    setIsChecking(false);
    // The navigation to other screens is handled in _layout.tsx
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Niste povezani na mrezu</Text>
      <Text style={styles.message}>
        Molimo vas povezite se na "secure" wifi mrezu
      </Text>
      <Button
        title={isChecking ? "Checking..." : "Retry"}
        onPress={checkNetwork}
        disabled={isChecking}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
});
