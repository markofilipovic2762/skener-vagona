import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export function useToken() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [userAd, setUserAd] = useState<string>("");

  const checkToken = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setAuthorized(false);
        return;
      }
      const payload = JSON.parse(atob(token.split(".")[1]));
      const { exp, user } = payload;
      if (user) {
        setUserAd(user);
      }
      if (!exp) {
        setAuthorized(false);
        return;
      }
      const now = Math.floor(Date.now() / 1000);
      if (exp < now) {
        setAuthorized(false);
        await AsyncStorage.removeItem("userToken");
        return;
      }
      setAuthorized(true);
    } catch (e) {
      console.error("Greška pri proveri tokena:", e);
      setAuthorized(false);
    }
  }, []);

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  return { authorized, userAd, checkToken };
}
