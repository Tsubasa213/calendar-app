"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        // サインアップ
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // トリガーによって自動的にusersテーブルにレコードが作成されます
          setIsSignUp(false);
        }
      } else {
        // ログイン
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          router.push("/");
        }
      }
    } catch (error: any) {
      setError(error.message || "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message || "ログインに失敗しました");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">With Calendar</h1>
          <p className="mt-2 text-slate-400">
            {isSignUp ? "新しいアカウントを作成" : "アカウントにログイン"}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800 p-8 shadow-xl">
          <form onSubmit={handleAuth} className="space-y-6">
            {/* メールアドレス */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                メールアドレス
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-slate-500"
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 py-3 pl-10 pr-4 text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                パスワード
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FontAwesomeIcon icon={faLock} className="text-slate-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 py-3 pl-10 pr-12 text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-300"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-slate-400">
                  6文字以上で入力してください
                </p>
              )}
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* ログイン/サインアップボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? "処理中..."
                : isSignUp
                  ? "アカウント作成"
                  : "ログイン"}
            </button>
          </form>

          {/* テストアカウントボタン */}
          {!isSignUp && (
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-800 px-2 text-slate-400">
                    または
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-lg border border-slate-600 bg-white py-3 font-semibold text-slate-800 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="size-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Googleでログイン
              </button>
            </div>
          )}

          {/* 切り替えリンク */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {isSignUp
                ? "すでにアカウントをお持ちですか? ログイン"
                : "アカウントをお持ちでない方はこちら"}
            </button>
          </div>
        </div>

        {/* フッター */}
        <p className="mt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Tsubasa. All rights reserved.
        </p>
      </div>
    </div>
  );
}
