"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faTrash,
  faEye,
  faEyeSlash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  // プロフィール設定
  const [displayName, setDisplayName] = useState("");

  // パスワード変更
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // メールアドレス変更
  const [newEmail, setNewEmail] = useState("");

  // カレンダー設定
  const [defaultStartTime, setDefaultStartTime] = useState("09:00");
  const [defaultEndTime, setDefaultEndTime] = useState("10:00");
  const [weekStartsOn, setWeekStartsOn] = useState("0"); // 0: 日曜, 1: 月曜

  // テーマカラー設定（ヘッダー・フッター共通）
  const [themeColor, setThemeColor] = useState("#1e293b"); // デフォルト: slate-800

  // アイコン設定
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // メッセージ
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // ユーザープロフィールを取得
    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setDisplayName(data.name || "");
        setAvatarUrl(data.avatar_url || null);
      }
    };

    fetchUserProfile();

    // ローカルストレージから設定を読み込み
    const savedSettings = localStorage.getItem("calendarSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDefaultStartTime(settings.defaultStartTime || "09:00");
      setDefaultEndTime(settings.defaultEndTime || "10:00");
      setWeekStartsOn(settings.weekStartsOn || "0");
      setThemeColor(settings.themeColor || "#1e293b");
    }
  }, [user, router, supabase]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // プロフィール更新
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user!.id);

      if (error) throw error;
      showMessage("success", "プロフィールを更新しました");
    } catch (error: any) {
      showMessage("error", `エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // パスワード変更
  const handleChangePassword = async () => {
    if (!currentPassword) {
      showMessage("error", "現在のパスワードを入力してください");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("error", "新しいパスワードが一致しません");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("error", "パスワードは6文字以上にしてください");
      return;
    }

    setLoading(true);
    try {
      // 現在のパスワードで再認証
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("現在のパスワードが正しくありません");
      }

      // パスワード更新
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage("success", "パスワードを変更しました");
    } catch (error: any) {
      showMessage("error", `エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // メールアドレス変更
  const handleChangeEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      setNewEmail("");
      showMessage(
        "success",
        "確認メールを送信しました。メールを確認してください。"
      );
    } catch (error: any) {
      showMessage("error", `エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // カレンダー設定を保存
  const handleSaveCalendarSettings = () => {
    const settings = {
      defaultStartTime,
      defaultEndTime,
      weekStartsOn,
      themeColor,
    };
    localStorage.setItem("calendarSettings", JSON.stringify(settings));
    showMessage("success", "設定を保存しました");

    // ページをリロードして設定を反映
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // アイコン画像をアップロード
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        showMessage("error", "ファイルが選択されていません");
        return;
      }

      const file = event.target.files[0];
      console.log("Selected file:", file.name, file.size, "bytes");

      // ファイルサイズチェック (2MB)
      if (file.size > 2 * 1024 * 1024) {
        showMessage("error", "ファイルサイズは2MB以下にしてください");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user!.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log("Uploading to:", filePath);

      // ファイルをアップロード
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful");

      // 公開URLを取得
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      console.log("Public URL:", publicUrl);

      // データベースを更新
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user!.id);

      if (updateError) {
        console.error("Database update error:", updateError);
        throw updateError;
      }

      console.log("Database updated successfully");

      setAvatarUrl(publicUrl);
      showMessage("success", "アイコンを更新しました");
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      showMessage("error", `エラー: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // アイコンを削除
  const handleAvatarRemove = async () => {
    try {
      setUploading(true);

      const { error } = await supabase
        .from("users")
        .update({ avatar_url: null })
        .eq("id", user!.id);

      if (error) throw error;

      setAvatarUrl(null);
      showMessage("success", "アイコンを削除しました");
    } catch (error: any) {
      showMessage("error", `エラー: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // アカウント削除
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "本当にアカウントを削除しますか？この操作は取り消せません。"
    );

    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      "削除を確定するには「削除」と入力してください"
    );

    if (doubleConfirm !== "削除") {
      showMessage("error", "削除がキャンセルされました");
      return;
    }

    setLoading(true);
    try {
      // ユーザーデータを削除（カスケード削除により関連データも削除される）
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", user!.id);

      if (error) throw error;

      // 認証アカウントを削除
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error: any) {
      showMessage("error", `エラー: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-200"
            aria-label="戻る"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="size-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">アカウント設定</h1>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div
            className={`mb-6 rounded-lg p-4 ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* コンテンツエリア */}
        <div className="space-y-6">
          {/* プロフィール設定 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              プロフィール設定
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateProfile();
              }}
              autoComplete="off"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ニックネーム
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="表示名を入力"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    name="user-display-name"
                    id="user-display-name"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </div>

                {/* アイコン設定 */}
                <div className="border-t pt-4">
                  <label className="mb-3 block text-sm font-medium text-gray-700">
                    アイコン画像
                  </label>
                  <div className="flex items-start gap-6">
                    {/* アイコンプレビュー */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-32 overflow-hidden rounded-full border-2 border-gray-300 bg-gray-100">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt="アイコン"
                            width={128}
                            height={128}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-gray-400">
                            <FontAwesomeIcon
                              icon={faUser}
                              className="text-5xl"
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        推奨: 正方形、最大2MB
                      </p>
                    </div>

                    {/* アップロードボタン */}
                    <div className="flex flex-1 flex-col gap-3">
                      <div>
                        <label
                          htmlFor="avatar-upload"
                          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-blue-600 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-500/20 ${
                            uploading ? "cursor-not-allowed opacity-50" : ""
                          }`}
                        >
                          <span>
                            {uploading ? "アップロード中..." : "画像を選択"}
                          </span>
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </div>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleAvatarRemove}
                          disabled={uploading}
                          className="inline-flex w-fit items-center gap-2 rounded-lg border border-red-600 px-4 py-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          <span>アイコンを削除</span>
                        </button>
                      )}

                      <p className="text-sm text-gray-600">
                        ヘッダーとプロフィールに表示されるアイコン画像を設定できます。
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-blue-600 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>保存</span>
                </button>
              </div>
            </form>
          </div>

          {/* カレンダー設定 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              カレンダー設定
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  デフォルトの開始時刻
                </label>
                <input
                  type="time"
                  value={defaultStartTime}
                  onChange={(e) => setDefaultStartTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  デフォルトの終了時刻
                </label>
                <input
                  type="time"
                  value={defaultEndTime}
                  onChange={(e) => setDefaultEndTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  週の始まり
                </label>
                <select
                  value={weekStartsOn}
                  onChange={(e) => setWeekStartsOn(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="0">日曜日</option>
                  <option value="1">月曜日</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  テーマカラー
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  ヘッダーとフッターの背景色を変更できます
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="size-12 cursor-pointer rounded-lg border-2 border-gray-300 transition-all hover:border-blue-500"
                    title="カラーピッカーで色を選択"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#1e293b"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      title="カラーコード (例: #1e293b)"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      例: #1e293b, #3b82f6, #ef4444
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSaveCalendarSettings}
                className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-blue-600 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-500/20"
              >
                設定を保存
              </button>
            </div>
          </div>

          {/* アカウント認証情報 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              アカウント認証情報
            </h2>

            {/* メールアドレス変更 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleChangeEmail();
              }}
              autoComplete="off"
              className="mb-6"
            >
              <h3 className="mb-3 text-base font-semibold text-gray-700">
                メールアドレス変更
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    現在のメールアドレス
                  </label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    新しいメールアドレス
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="新しいメールアドレス"
                    autoComplete="off"
                    name="new-email-address"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !newEmail}
                  className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-blue-600 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>メールアドレスを変更</span>
                </button>
                <p className="text-sm text-gray-600">
                  ※変更後、新しいメールアドレスに確認メールが送信されます
                </p>
              </div>
            </form>

            {/* 区切り線 */}
            <div className="my-6 border-t border-gray-200"></div>

            {/* パスワード変更 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleChangePassword();
              }}
              autoComplete="off"
            >
              <h3 className="mb-3 text-base font-semibold text-gray-700">
                パスワード変更
              </h3>
              {/* ダミーフィールドでオートフィルを防ぐ */}
              <input
                type="text"
                name="username"
                autoComplete="username"
                style={{ display: "none" }}
                tabIndex={-1}
              />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    現在のパスワード
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="現在のパスワード"
                      autoComplete="off"
                      name="current-password-verify"
                      data-lpignore="true"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    新しいパスワード
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="新しいパスワード（6文字以上）"
                      autoComplete="new-password"
                      name="new-password-field"
                      data-lpignore="true"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    新しいパスワード（確認）
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="新しいパスワード（確認）"
                    autoComplete="new-password"
                    name="confirm-password-field"
                    data-lpignore="true"
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-blue-600 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>パスワードを変更</span>
                </button>
              </div>
            </form>
          </div>

          {/* アカウント削除 */}
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-red-800">
              危険な操作
            </h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm text-red-700">
                  アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:bg-gray-300"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span>アカウントを削除</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
