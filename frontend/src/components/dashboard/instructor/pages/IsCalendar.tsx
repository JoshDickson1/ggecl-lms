import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const IsCalendar = () => {
  const [events] = useState([
    { title: "Design Review", date: "2025-10-02", color: "#f87171" },
    { title: "Meeting", date: "2025-10-05", color: "#facc15" },
    { title: "Market Research", date: "2025-10-14", color: "#4ade80" },
    { title: "Discussion", date: "2025-10-14", color: "#60a5fa" },
    { title: "New Deals", date: "2025-10-29", color: "#f97316" },
  ]);

  return (
    <div className="min-h-screen bg-white p-6 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="mb-5 space-y-0.5">
          <h1 className="text-3xl font-bold md:text-4xl">Calendar</h1>
          <p className="text-muted-foreground text-sm">
            Manage and schedule events.
          </p>
        </div>{" "}
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventContent={(eventInfo) => (
          <span
            className="mf rounded px-2 py-1 text-white"
            style={{ backgroundColor: eventInfo.event.extendedProps.color }}
          >
            {eventInfo.event.title}
          </span>
        )}
        headerToolbar={{
          start: "title",
          center: "",
          end: "today prev,next",
        }}
      />
    </div>
  );
};

export default IsCalendar;
