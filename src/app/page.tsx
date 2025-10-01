"use client";

import React from "react";
import CalendarComponent from "@/app/_components/Calendar";

const Page: React.FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-100 p-4">
      <div className="flex w-full max-w-md flex-col items-center sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <CalendarComponent />
      </div>
    </main>
  );
};

export default Page;
