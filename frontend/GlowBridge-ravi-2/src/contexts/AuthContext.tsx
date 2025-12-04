"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { fetchUserByEmail, createUser } from "@/lib/userApi";
import { UserCookies, UserCookieData } from "@/lib/cookies";

interface AuthContextType {
  user: User | null;
  userData: UserCookieData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserCookieData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const savedUserData = UserCookies.getUserData();
    if (savedUserData) {
      setUserData(savedUserData);
    }

    try {
      const firebaseAuth = auth();
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        setUser(user);

        if (!user && savedUserData) {
          UserCookies.clearAllUserCookies();
          setUserData(null);
        }

        setLoading(false);
      });

      return unsubscribe;
    } catch {
      setLoading(false);
      return;
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const firebaseAuth = auth();
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );

      try {
        const dbUser = await fetchUserByEmail(firebaseUser.email || email);

        const userCookieData: UserCookieData = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone,
          role: dbUser.role.toLowerCase(),
          status: dbUser.status,
          joinDate: dbUser.joinDate,
          salonId: dbUser.salonId,
        };

        UserCookies.setUserData(userCookieData);
        setUserData(userCookieData);

        toast.success("Welcome back!");
      } catch {
        await signOut(firebaseAuth);

        toast.error(
          "Account not found in our system. Please contact support or create a new account."
        );
        throw new Error("User account not found in database");
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { code?: string })?.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : "Failed to sign in";
      toast.error(errorMessage);
      throw error;
    }
  };

  const signUp = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => {
    try {
      const dbUser = await createUser({
        name,
        email,
        phone,
        role: "customer",
        status: "active",
        password,
      });

      const userCookieData: UserCookieData = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        role: dbUser.role.toLowerCase(),
        status: dbUser.status,
        joinDate: dbUser.joinDate,
        salonId: dbUser.salonId,
      };

      UserCookies.setUserData(userCookieData);
      setUserData(userCookieData);

      toast.success("Account created successfully! Welcome to GlowBridge!");
    } catch (error: unknown) {
      let errorMessage = "Failed to create account";

      if (error instanceof Error) {
        if (
          error.message.includes("email already exists") ||
          error.message.includes("already in use")
        ) {
          errorMessage = "An account with this email already exists";
        } else if (
          error.message.includes("weak password") ||
          error.message.includes("password")
        ) {
          errorMessage =
            "Password is too weak. Please use at least 6 characters";
        } else if (
          error.message.includes("invalid email") ||
          error.message.includes("email")
        ) {
          errorMessage = "Please enter a valid email address";
        } else {
          errorMessage = error.message || "Failed to create account";
        }
      }

      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const firebaseAuth = auth();
      await signOut(firebaseAuth);

      UserCookies.clearAllUserCookies();
      setUserData(null);

      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const firebaseAuth = auth();
      await sendPasswordResetEmail(firebaseAuth, email);
      toast.success("Password reset email sent!");
    } catch (error: unknown) {
      const errorMessage =
        (error as { code?: string })?.code === "auth/user-not-found"
          ? "No account found with this email"
          : "Failed to send reset email";
      toast.error(errorMessage);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
