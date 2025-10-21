"use client";

import React, { createContext, useContext, useState } from "react";

interface CalendarContextType {
  goToToday: (() => void) | null;
  setGoToToday: (fn: () => void) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [goToToday, setGoToTodayFn] = useState<(() => void) | null>(null);

  const setGoToToday = (fn: () => void) => {
    setGoToTodayFn(() => fn);
  };

  return (
    <CalendarContext.Provider value={{ goToToday, setGoToToday }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
};
