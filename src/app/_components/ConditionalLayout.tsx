"use client";

import { usePathname } from "next/navigation";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 overflow-hidden">{children}</main>
      <Footer />
    </>
  );
}
