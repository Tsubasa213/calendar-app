"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CalendarContextType {
  goToToday: (() => void) | null;
  setGoToToday: (fn: () => void) => void;
  openAddEventModal: (() => void) | null;
  setOpenAddEventModal: (fn: () => void) => void;
  currentCalendarId: string | null;
  setCurrentCalendarId: (id: string | null) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [goToToday, setGoToTodayFn] = useState<(() => void) | null>(null);
  const [openAddEventModal, setOpenAddEventModalFn] = useState<
    (() => void) | null
  >(null);
  const [currentCalendarId, setCurrentCalendarIdState] = useState<
    string | null
  >(null);

  // Load current calendar ID from localStorage on mount
  useEffect(() => {
    const savedCalendarId = localStorage.getItem("currentCalendarId");
    if (savedCalendarId) {
      setCurrentCalendarIdState(savedCalendarId);
    }
  }, []);

  const setGoToToday = (fn: () => void) => {
    setGoToTodayFn(() => fn);
  };

  const setOpenAddEventModal = (fn: () => void) => {
    setOpenAddEventModalFn(() => fn);
  };

  const setCurrentCalendarId = (id: string | null) => {
    setCurrentCalendarIdState(id);
    if (id) {
      localStorage.setItem("currentCalendarId", id);
    } else {
      localStorage.removeItem("currentCalendarId");
    }
  };

  return (
    <CalendarContext.Provider
      value={{
        goToToday,
        setGoToToday,
        openAddEventModal,
        setOpenAddEventModal,
        currentCalendarId,
        setCurrentCalendarId,
      }}
    >
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
