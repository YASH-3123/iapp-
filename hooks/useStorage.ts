import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export function useStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored));
    } catch (e) {}
    finally { setLoaded(true); }
  };

  const save = async (newValue: T) => {
    try {
      setValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    } catch (e) {}
  };

  const remove = async () => {
    try {
      setValue(defaultValue);
      await AsyncStorage.removeItem(key);
    } catch (e) {}
  };

  return { value, save, remove, loaded };
}