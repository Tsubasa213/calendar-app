"use client";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faCircleUser,
  faRightFromBracket,
  faGear,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import CalendarSelectorModal from "./CalendarSelectorModal";
import { useCalendar } from "@/app/context/CalendarContext";

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { currentCalendarId, setCurrentCalendarId } = useCalendar();
  const [showMenu, setShowMenu] = useState(false);
  const [showCalendarSelector, setShowCalendarSelector] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentCalendarName, setCurrentCalendarName] = useState<string | null>(
    null
  );
  const [themeColor, setThemeColor] = useState("#1e293b"); // デフォルトはslate-800
  const router = useRouter();
  const supabase = createClient();

  // 背景色の明度に基づいて文字色を決定する関数
  const getTextColor = (bgColor: string): string => {
    // HEXカラーをRGBに変換
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // 相対輝度を計算（WCAG 2.0の式）
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // 輝度が0.5以上なら黒、それ以下なら白
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  useEffect(() => {
    // localStorageから色設定を読み込む
    const savedSettings = localStorage.getItem("calendarSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.themeColor) {
        setThemeColor(settings.themeColor);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      // ユーザーの表示名とアバター画像を取得
      const fetchUserProfile = async () => {
        const { data } = await supabase
          .from("users")
          .select("name, avatar_url")
          .eq("id", user.id)
          .single();

        if (data) {
          setDisplayName(data.name);
          setAvatarUrl(data.avatar_url);
        }
      };

      fetchUserProfile();
    }
  }, [user, supabase]);

  useEffect(() => {
    if (currentCalendarId) {
      // 現在のカレンダー名を取得
      const fetchCalendarName = async () => {
        const { data } = await supabase
          .from("calendars")
          .select("name")
          .eq("id", currentCalendarId)
          .single();

        if (data) {
          setCurrentCalendarName(data.name);
        }
      };

      fetchCalendarName();
    } else {
      setCurrentCalendarName(null);
    }
  }, [currentCalendarId, supabase]);

  const handleSignOut = async () => {
    await signOut();
    setShowMenu(false);
  };

  const handleSettings = () => {
    setShowMenu(false);
    router.push("/settings");
  };

  // ホバー時の背景色を生成（背景色を少し暗くまたは明るくする）
  const getHoverColor = (bgColor: string): string => {
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // 明るい色なら暗く、暗い色なら明るく
    const factor = luminance > 0.5 ? 0.9 : 1.1;
    const newR = Math.min(255, Math.floor(r * factor));
    const newG = Math.min(255, Math.floor(g * factor));
    const newB = Math.min(255, Math.floor(b * factor));

    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  };

  return (
    <header>
      <div className="py-2" style={{ backgroundColor: themeColor }}>
        {/* PC版: サイドバー分のスペーサー */}
        <div className="flex">
          <div className="hidden w-56 lg:block"></div>
          <div
            className="flex flex-1 items-center justify-between px-2 text-lg font-bold sm:px-3 md:px-4 lg:pl-24 lg:pr-28"
            style={{ color: getTextColor(themeColor) }}
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendar} className="mr-2" />
              <span>Calendar</span>
              {currentCalendarName && (
                <span className="text-sm font-normal opacity-60">
                  - {currentCalendarName}
                </span>
              )}
            </div>
            {user && (
              <div className="flex items-center gap-2">
                {/* カレンダー切り替えボタン（デスクトップのみ） */}
                <button
                  className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:flex"
                  style={{
                    backgroundColor: "transparent",
                    color: getTextColor(themeColor),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      getHoverColor(themeColor);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  onClick={() => setShowCalendarSelector(true)}
                >
                  <FontAwesomeIcon icon={faCalendarDays} />
                  <span>カレンダー切替</span>
                </button>

                <div className="relative ml-8">
                  <button
                    className="flex items-center justify-center rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        getHoverColor(themeColor);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    {avatarUrl ? (
                      <div className="size-8 overflow-hidden rounded-full">
                        <Image
                          src={avatarUrl}
                          alt="アイコン"
                          width={32}
                          height={32}
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="px-3 py-1">
                        <FontAwesomeIcon icon={faCircleUser} />
                      </div>
                    )}
                  </button>

                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div
                        className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg shadow-lg"
                        style={{ backgroundColor: themeColor }}
                      >
                        <div
                          className="border-b px-4 py-3"
                          style={{
                            borderColor: getHoverColor(themeColor),
                            color: getTextColor(themeColor),
                          }}
                        >
                          <p className="text-sm opacity-70">ログイン中</p>
                          {displayName && (
                            <p className="truncate text-sm font-semibold">
                              {displayName}
                            </p>
                          )}
                          <p className="truncate text-xs opacity-70">
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={handleSettings}
                          className="flex w-full items-center gap-2 px-4 py-3 text-sm transition-colors"
                          style={{ color: getTextColor(themeColor) }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              getHoverColor(themeColor);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <FontAwesomeIcon icon={faGear} />
                          <span>アカウント設定</span>
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 px-4 py-3 text-sm transition-colors"
                          style={{ color: getTextColor(themeColor) }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              getHoverColor(themeColor);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <FontAwesomeIcon icon={faRightFromBracket} />
                          <span>ログアウト</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CalendarSelectorModal
        isOpen={showCalendarSelector}
        onClose={() => setShowCalendarSelector(false)}
        currentCalendarId={currentCalendarId || undefined}
        onSelectCalendar={(calendarId) => {
          setCurrentCalendarId(calendarId);
          setShowCalendarSelector(false);
        }}
      />
    </header>
  );
};

export default Header;
