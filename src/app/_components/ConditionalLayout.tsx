"use client";

import { usePathname } from "next/navigation";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import Sidebar from "@/app/_components/Sidebar";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isSettingsPage = pathname === "/settings";
  const isCalendarsPage = pathname === "/calendars";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className={`flex-1 ${isSettingsPage || isCalendarsPage ? "overflow-auto" : "overflow-hidden"}`}
        >
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
