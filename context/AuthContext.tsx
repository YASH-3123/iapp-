import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

type User = {
  fullName: string;
  email: string;
  password: string;
  mobile: string;
  gender: string;
  address: string;
  city: string;
};

type AuthContextType = {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  register: (userData: User) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const session = await AsyncStorage.getItem("session");
      if (session) {
        setUser(JSON.parse(session));
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoaded(true);
    }
  };

  const register = async (userData: User) => {
    const users = await AsyncStorage.getItem("users");
    const parsed = users ? JSON.parse(users) : [];
    const exists = parsed.find((u: User) => u.email === userData.email);
    if (exists) throw new Error("Email already registered");
    parsed.push(userData);
    await AsyncStorage.setItem("users", JSON.stringify(parsed));
    await AsyncStorage.setItem("session", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    const users = await AsyncStorage.getItem("users");
    const parsed = users ? JSON.parse(users) : [];
    const found = parsed.find(
      (u: User) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );
    if (found) {
      await AsyncStorage.setItem("session", JSON.stringify(found));
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await AsyncStorage.removeItem("session");
    setUser(null);
  };
  
  const updateUser = async (updatedUser: User) => {
  await AsyncStorage.setItem("session", JSON.stringify(updatedUser));
  setUser(updatedUser);
};

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn: !!user,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}