import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated?: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // const [userToken, setUserToken] = useState<string | null>(null);
  // const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   const loadToken = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem("userToken");
  //       setUserToken(token);
  //     } catch (e) {
  //       console.error("Failed to load token", e);
  //     } finally {
  //       setIsLoadingToken(false);
  //     }
  //   };

  //   loadToken();
  // }, []);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     //await AsyncStorage.removeItem("userToken");
  //     // setUserToken(null);
  //     const token = await AsyncStorage.getItem("userToken");
  //     if (!token) {
  //       router.replace("/login");
  //       return;
  //     }
  //     try {
  //       const payload = JSON.parse(atob(token.split(".")[1]));
  //       // const { role } = payload;

  //       // if (!role) {
  //       //   router.replace("/login");
  //       // }

  //       //setRola(role);
  //       const isExpired = payload.exp * 1000 < Date.now();

  //       if (isExpired) {
  //         await AsyncStorage.removeItem("userToken");
  //         router.replace("/login");
  //       } else {
  //         setIsAuthenticated(true);
  //       }
  //     } catch (error) {
  //       alert("Neuspelo dekodiranje tokena");
  //       router.replace("/login");
  //     }
  //   };
  //   checkAuth();
  // }, []);

  // if (isLoadingToken) {
  //   return null; // Or a loading indicator if needed
  // }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;
