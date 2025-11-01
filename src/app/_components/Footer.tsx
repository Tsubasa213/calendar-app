"use client";

import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faPlus,
  faCalendarPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useCalendar } from "@/app/context/CalendarContext";
import { useRouter, usePathname } from "next/navigation";

const Footer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("calendar");
  const [themeColor, setThemeColor] = useState("#1e293b"); // デフォルトはslate-800
  const { goToToday, openAddEventModal } = useCalendar();
  const router = useRouter();
  const pathname = usePathname();

  // 背景色の明度に基づいて文字色を決定する関数
  const getTextColor = (bgColor: string): string => {
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  // ホバー時の背景色を生成
  const getHoverColor = (bgColor: string): string => {
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const factor = luminance > 0.5 ? 0.9 : 1.1;
    const newR = Math.min(255, Math.floor(r * factor));
    const newG = Math.min(255, Math.floor(g * factor));
    const newB = Math.min(255, Math.floor(b * factor));
    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  };

  // アクティブな項目の強調色
  const getAccentColor = (bgColor: string): string => {
    const textColor = getTextColor(bgColor);
    // 明るい背景なら青、暗い背景ならシアン
    return textColor === "#000000" ? "#3b82f6" : "#60a5fa";
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

  const handleCalendarClick = () => {
    setActiveSection("calendar");
    // 設定ページまたはカレンダー管理ページにいる場合はカレンダーページに戻る
    if (pathname === "/settings" || pathname === "/calendars") {
      router.push("/");
    } else if (goToToday) {
      goToToday();
    }
  };

  const handleAddEventClick = () => {
    setActiveSection("add");
    if (openAddEventModal) {
      openAddEventModal();
    }
  };

  const handleCalendarManageClick = () => {
    setActiveSection("manage");
    router.push("/calendars");
  };

  const navItems = [
    {
      id: "calendar",
      icon: faCalendarDays,
      label: "カレンダー",
      onClick: handleCalendarClick,
    },
    {
      id: "add",
      icon: faPlus,
      label: "予定追加",
      onClick: handleAddEventClick,
    },
    {
      id: "manage",
      icon: faCalendarPlus,
      label: "カレンダー設定",
      onClick: handleCalendarManageClick,
    },
  ];

  return (
    <footer className="lg:hidden" style={{ backgroundColor: themeColor }}>
      {/* ナビゲーション */}
      <div
        className="border-b"
        style={{ borderColor: getHoverColor(themeColor) }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-around px-4">
          {navItems.map((item) => {
            // 設定画面またはカレンダー管理画面では予定追加ボタンを無効化
            const isDisabled =
              (pathname === "/settings" || pathname === "/calendars") &&
              item.id === "add";

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                disabled={isDisabled}
                className="flex flex-1 flex-col items-center gap-1 py-2 transition-colors"
                style={{
                  color: getTextColor(themeColor),
                  opacity: isDisabled
                    ? 0.3
                    : activeSection === item.id
                      ? 0.9
                      : 0.5,
                  borderBottom:
                    activeSection === item.id
                      ? `2px solid ${getTextColor(themeColor)}`
                      : "none",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== item.id && !isDisabled) {
                    e.currentTarget.style.backgroundColor =
                      getHoverColor(themeColor);
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <FontAwesomeIcon icon={item.icon} className="size-5 text-lg" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
