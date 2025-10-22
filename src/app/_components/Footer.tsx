"use client";

import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopyright,
  faFish,
  faCalendarDays,
  faListCheck,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useCalendar } from "@/app/context/CalendarContext";

const Footer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("calendar");
  const { goToToday } = useCalendar();

  const handleCalendarClick = () => {
    setActiveSection("calendar");
    if (goToToday) {
      goToToday();
    }
  };

  const navItems = [
    {
      id: "calendar",
      icon: faCalendarDays,
      label: "カレンダー",
      onClick: handleCalendarClick,
    },
    {
      id: "tasks",
      icon: faListCheck,
      label: "タスク",
      onClick: () => setActiveSection("tasks"),
    },
    {
      id: "settings",
      icon: faGear,
      label: "設定",
      onClick: () => setActiveSection("settings"),
    },
  ];

  return (
    <footer className="bg-slate-800">
      {/* ナビゲーション */}
      <div className="border-b border-slate-700">
        <div className="mx-auto flex max-w-2xl items-center justify-around px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={twMerge(
                "flex flex-1 flex-col items-center gap-1 py-2 transition-colors",
                "hover:bg-slate-700",
                activeSection === item.id
                  ? "border-b-2 border-blue-400 text-blue-400"
                  : "text-slate-400"
              )}
            >
              <FontAwesomeIcon icon={item.icon} className="text-lg" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* コピーライト */}
      <div className="py-1">
        <div
          className={twMerge(
            "mx-4 max-w-2xl md:mx-auto",
            "flex items-center justify-between",
            "text-xs text-slate-300"
          )}
        >
          <div className="flex items-center space-x-2">
            <span>With Calendar</span>
          </div>
          <div className="flex items-center space-x-1">
            <FontAwesomeIcon icon={faCopyright} />
            <span>{new Date().getFullYear()} Tsubasa</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
