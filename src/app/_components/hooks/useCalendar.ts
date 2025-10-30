import { useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";

export function useCalendar(
  onCalendarReady?: (goToToday: () => void) => void,
  onAddEventReady?: (openAddEventModal: () => void) => void,
  openAddEventModal?: () => void
) {
  const calendarRef = useRef<FullCalendar>(null);

  // goToToday関数を作成してContextに登録
  const registerGoToToday = () => {
    if (onCalendarReady && calendarRef.current) {
      const goToToday = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
          calendarApi.today();
        }
      };
      onCalendarReady(goToToday);
    }

    if (onAddEventReady && openAddEventModal) {
      onAddEventReady(openAddEventModal);
    }
  };

  return {
    calendarRef,
    registerGoToToday,
  };
}
