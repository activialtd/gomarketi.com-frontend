import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

/**
 * All auth logic is isolated here. Screens never call an API directly —
 * they call these methods. When the backend is ready, only this file changes.
 *
 * Real wiring later:
 *   - Google  → expo-auth-session (Google provider)
 *   - Apple   → expo-apple-authentication
 *   - Email   → your GoMarketi API (sign up / sign in / send + verify OTP)
 */

type User = {
  id: string;
  fullName: string;
  email: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // credential flows
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  // email verification
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signInWithEmail = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    // TODO(backend): POST /auth/login { email, password } → { user, token }
    await wait(900);
    setUser({ id: "mock-1", fullName: email.split("@")[0], email });
    setIsLoading(false);
  }, []);

  const signUpWithEmail = useCallback(
    async (fullName: string, email: string, _password: string) => {
      setIsLoading(true);
      // TODO(backend): POST /auth/signup { fullName, email, password }
      // then trigger sendOtp(email). We DON'T set the user until OTP is verified.
      await wait(900);
      setIsLoading(false);
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    // TODO(backend): expo-auth-session Google flow → exchange token with API
    await wait(700);
    setUser({ id: "mock-g", fullName: "Google User", email: "user@gmail.com" });
    setIsLoading(false);
  }, []);

  const signInWithApple = useCallback(async () => {
    setIsLoading(true);
    // TODO(backend): expo-apple-authentication → exchange identityToken with API
    await wait(700);
    setUser({ id: "mock-a", fullName: "Apple User", email: "user@icloud.com" });
    setIsLoading(false);
  }, []);

  const sendOtp = useCallback(async (_email: string) => {
    // TODO(backend): POST /auth/otp/send { email }
    await wait(500);
  }, []);

  const verifyOtp = useCallback(async (email: string, _code: string) => {
    setIsLoading(true);
    // TODO(backend): POST /auth/otp/verify { email, code } → { user, token }
    await wait(800);
    setUser({ id: "mock-otp", fullName: email.split("@")[0], email });
    setIsLoading(false);
  }, []);

  const signOut = useCallback(() => {
    // TODO(backend): clear stored token (SecureStore) + revoke session
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        sendOtp,
        verifyOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
