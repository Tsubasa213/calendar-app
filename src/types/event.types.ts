import { Database } from "./database";

export type Event = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
};

export type DbEvent = Database["public"]["Tables"]["events"]["Row"];

export interface CalendarComponentProps {
  onCalendarReady?: (goToToday: () => void) => void;
  onAddEventReady?: (openAddEventModal: () => void) => void;
}

export interface EventFormData {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  genre: string;
  memo: string;
}
