"use client";

import CalendarComponent from "@/app/_components/Calendar";
import { useCalendar } from "@/app/context/CalendarContext";

export default function Page() {
  const { setGoToToday } = useCalendar();

  const handleCalendarReady = (goToToday: () => void) => {
    setGoToToday(goToToday);
  };

  return <CalendarComponent onCalendarReady={handleCalendarReady} />;
}
