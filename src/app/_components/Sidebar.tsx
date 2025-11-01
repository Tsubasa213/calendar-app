"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faPlus,
  faCalendarPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useCalendar } from "@/app/context/CalendarContext";
import { useRouter, usePathname } from "next/navigation";

const Sidebar: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("calendar");
  const { goToToday, openAddEventModal } = useCalendar();
  const router = useRouter();
  const pathname = usePathname();

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
    <aside className="hidden w-56 flex-col border-r border-gray-200 bg-white lg:flex">
      <nav className="flex flex-1 flex-col gap-2 p-4">
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
              className={`flex items-center gap-4 rounded-lg px-5 py-4 text-left text-base transition-colors ${
                isDisabled
                  ? "cursor-not-allowed text-gray-400 opacity-50"
                  : activeSection === item.id
                    ? "bg-blue-100 font-semibold text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-5 text-xl" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
