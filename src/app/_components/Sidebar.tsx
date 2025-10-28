"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faPlus,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useCalendar } from "@/app/context/CalendarContext";

const Sidebar: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("calendar");
  const { goToToday, openAddEventModal } = useCalendar();

  const handleCalendarClick = () => {
    setActiveSection("calendar");
    if (goToToday) {
      goToToday();
    }
  };

  const handleAddEventClick = () => {
    setActiveSection("add");
    if (openAddEventModal) {
      openAddEventModal();
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
      id: "add",
      icon: faPlus,
      label: "予定追加",
      onClick: handleAddEventClick,
    },
    {
      id: "settings",
      icon: faGear,
      label: "設定",
      onClick: () => setActiveSection("settings"),
    },
  ];

  return (
    <aside className="hidden w-56 flex-col border-r border-gray-200 bg-white lg:flex">
      <nav className="flex flex-1 flex-col gap-2 p-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex items-center gap-4 rounded-lg px-5 py-4 text-left text-base transition-colors ${
              activeSection === item.id
                ? "bg-blue-100 font-semibold text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className="text-xl" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
