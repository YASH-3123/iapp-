import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type StoredUser = {
  fullName: string;
  email: string;
  mobile: string;
  gender: string;
  address: string;
  city: string;
  password: string;
};

export type PublicUser = Omit<StoredUser, "password">;

type RegisterInput = StoredUser;

type AuthContextType = {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: PublicUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const USERS_KEY = "@gallery_app/users"; // list of all registered accounts
const SESSION_KEY = "@gallery_app/session"; // currently logged-in user

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);

  // Restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const session = await AsyncStorage.getItem(SESSION_KEY);
        if (session) {
          setUser(JSON.parse(session));
          setIsSignedIn(true);
        }
      } catch (err) {
        console.warn("Failed to restore session:", err);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const getUsers = async (): Promise<StoredUser[]> => {
    try {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn("Failed to read users:", err);
      return [];
    }
  };

  const register = async (data: RegisterInput) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    const users = await getUsers();

    const alreadyExists = users.some(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (alreadyExists) {
      throw new Error("An account with this email already exists.");
    }

    const newUser: StoredUser = { ...data, email: normalizedEmail };
    const updatedUsers = [...users, newUser];

    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    // Note: we intentionally do NOT sign the user in here.
    // They're redirected to the sign-in screen after registering.
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = await getUsers();

    const match = users.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (!match) return false;

    const { password: _omit, ...publicUser } = match;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));
    setUser(publicUser);
    setIsSignedIn(true);
    return true;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ isLoaded, isSignedIn, user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}