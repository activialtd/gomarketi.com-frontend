import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import * as api from "./api-client";

type User = {
  id: string;
  fullName: string;
  email: string;
};

function toUser(dto: api.UserDTO): User {
  return {
    id: dto.id,
    fullName: dto.full_name ?? dto.email?.split("@")[0] ?? "",
    email: dto.email ?? "",
  };
}

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoring: boolean;
  authError: string | null;
  // credential flows
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  // email verification (also used as the post-signup verification step)
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  // forgot password
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (otp: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // OTP request/verify is a two-step flow — the session token from
  // /otp/request must be threaded into /otp/verify. Both sendOtp calls
  // (post-signup verification and forgot-password resend) go through the
  // same underlying endpoint, so a single pending-token slot per flow works.
  const [otpSessionToken, setOtpSessionToken] = useState<string | null>(null);
  const [resetSessionToken, setResetSessionToken] = useState<string | null>(null);

  useEffect(() => {
    api
      .restoreSession()
      .then((dto) => {
        if (dto) setUser(toUser(dto));
      })
      .finally(() => setIsRestoring(false));
  }, []);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      return await fn();
    } catch (err) {
      setAuthError(err instanceof api.ApiError ? err.message : "something went wrong");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(
    (email: string, password: string) =>
      run(async () => {
        const resp = await api.login(email, password);
        setUser(toUser(resp.user));
      }),
    [run]
  );

  const signUpWithEmail = useCallback(
    (fullName: string, email: string, password: string) =>
      run(async () => {
        const [firstName, ...rest] = fullName.trim().split(/\s+/);
        await api.register({
          firstName: firstName ?? fullName,
          lastName: rest.join(" ") || firstName || fullName,
          email,
          password,
        });
        // Don't set the user yet — the screen calls sendOtp + waits for
        // verifyOtp before the app treats this account as signed in.
      }),
    [run]
  );

  const signInWithGoogle = useCallback(async () => {
    // TODO: wire expo-auth-session Google provider, then call api.googleAuth(idToken).
    setAuthError("Google sign-in isn't set up yet.");
  }, []);

  const signInWithApple = useCallback(async () => {
    // TODO: wire expo-apple-authentication, then call api.appleAuth(...).
    setAuthError("Apple sign-in isn't set up yet.");
  }, []);

  const sendOtp = useCallback(
    (email: string) =>
      run(async () => {
        const { session_token } = await api.requestOtp(email);
        setOtpSessionToken(session_token);
      }),
    [run]
  );

  const verifyOtp = useCallback(
    (_email: string, code: string) =>
      run(async () => {
        if (!otpSessionToken) {
          throw new api.ApiError(400, "request a new code first");
        }
        const resp = await api.verifyOtp(otpSessionToken, code);
        setOtpSessionToken(null);
        setUser(toUser(resp.user));
      }),
    [run, otpSessionToken]
  );

  const requestPasswordReset = useCallback(
    (email: string) =>
      run(async () => {
        const { session_token } = await api.forgotPassword(email);
        setResetSessionToken(session_token);
      }),
    [run]
  );

  const resetPassword = useCallback(
    (otp: string, newPassword: string) =>
      run(async () => {
        if (!resetSessionToken) {
          throw new api.ApiError(400, "request a new code first");
        }
        await api.resetPassword({ sessionToken: resetSessionToken, otp, newPassword });
        setResetSessionToken(null);
      }),
    [run, resetSessionToken]
  );

  const signOut = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isRestoring,
        authError,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        sendOtp,
        verifyOtp,
        requestPasswordReset,
        resetPassword,
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
