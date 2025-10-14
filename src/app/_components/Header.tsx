"use client";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFish,
  faCalendar,
  faGear,
  faBars,
  faCircleUser,
} from "@fortawesome/free-solid-svg-icons";
import CalendarComponent from "./Calendar";

const Header: React.FC = () => {
  const handleSettingsClick = () => {
    // Handle settings click
  };

  return (
    <header>
      <div className="bg-slate-800 py-2">
        <div
          className={twMerge(
            "mx-4 max-w-3xl md:mx-auto",
            "flex items-center justify-between",
            "text-lg font-bold text-white"
          )}
        >
          <div>
            <FontAwesomeIcon icon={faCalendar} className="mr-2" />
            Calendar
          </div>
          <button
            className="rounded px-3 py-1 transition-colors duration-200 hover:bg-slate-700"
            onClick={handleSettingsClick}
          >
            <FontAwesomeIcon icon={faCircleUser} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
