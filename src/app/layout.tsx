import type { Metadata } from "next";
import "./globals.css";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import { CalendarProvider } from "@/app/context/CalendarContext";
import { AuthProvider } from "@/app/context/AuthContext";
import ConditionalLayout from "@/app/_components/ConditionalLayout";

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
        <AuthProvider>
          <CalendarProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </CalendarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
