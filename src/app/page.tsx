"use client";

import CalendarComponent from "@/app/_components/Calendar";
import { useCalendar } from "@/app/context/CalendarContext";

export default function Page() {
  const { setGoToToday, setOpenAddEventModal } = useCalendar();

  const handleCalendarReady = (goToToday: () => void) => {
    setGoToToday(goToToday);
  };

  const handleAddEventReady = (openAddEventModal: () => void) => {
    setOpenAddEventModal(openAddEventModal);
  };

  return (
    <CalendarComponent
      onCalendarReady={handleCalendarReady}
      onAddEventReady={handleAddEventReady}
    />
  );
}
