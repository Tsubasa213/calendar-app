"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    // 初回のユーザー情報取得
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // ログインページ以外でユーザーがいない場合、ログインページにリダイレクト
        if (!user && pathname !== "/login") {
          router.push("/login");
        }
        // ログイン済みでログインページにいる場合、ホームにリダイレクト
        else if (user && pathname === "/login") {
          router.push("/");
        }
      } catch (error) {
        console.error("ユーザー情報の取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (!session?.user && pathname !== "/login") {
        router.push("/login");
      } else if (session?.user && pathname === "/login") {
        router.push("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
