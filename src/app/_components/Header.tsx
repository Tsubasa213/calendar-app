"use client";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faCircleUser,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowMenu(false);
  };

  return (
    <header>
      <div className="bg-slate-800 py-2">
        {/* PC版: サイドバー分のスペーサー */}
        <div className="flex">
          <div className="hidden w-56 lg:block"></div>
          <div className="flex flex-1 items-center justify-between px-2 text-lg font-bold text-white sm:px-3 md:px-4 lg:pl-24 lg:pr-28">
            <div>
              <FontAwesomeIcon icon={faCalendar} className="mr-2" />
              Calendar
            </div>
            {user && (
              <div className="relative ml-8">
                <button
                  className="rounded px-3 py-1 transition-colors duration-200 hover:bg-slate-700"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <FontAwesomeIcon icon={faCircleUser} />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg bg-slate-700 shadow-lg">
                      <div className="border-b border-slate-600 px-4 py-3">
                        <p className="text-sm text-slate-400">ログイン中</p>
                        <p className="truncate text-sm font-medium text-white">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-600"
                      >
                        <FontAwesomeIcon icon={faRightFromBracket} />
                        <span>ログアウト</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
