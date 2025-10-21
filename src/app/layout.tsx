import type { Metadata } from "next";
import "./globals.css";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { CalendarProvider } from "@/app/context/CalendarContext";

export const metadata: Metadata = {
  title: "With Calendar",
  description: "Built to learn Next.js and modern web development.",
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout(props: Props) {
  const { children } = props;
  return (
    <html lang="ja">
      <body className="flex h-screen flex-col overflow-hidden">
        <CalendarProvider>
          <Header />
          <main className="flex-1 overflow-hidden">{children}</main>
          <Footer />
        </CalendarProvider>
      </body>
    </html>
  );
}
