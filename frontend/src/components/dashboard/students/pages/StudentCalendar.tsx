import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
<<<<<<< HEAD
import { Button } from "@/components/ui/button";
=======
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991

const StudentCalendar = () => {
  const [events] = useState([
    { title: "Design Review", date: "2025-10-02", color: "#f87171" },
    { title: "Meeting", date: "2025-10-05", color: "#facc15" },
    { title: "Market Research", date: "2025-10-14", color: "#4ade80" },
    { title: "Discussion", date: "2025-10-14", color: "#60a5fa" },
    { title: "New Deals", date: "2025-10-29", color: "#f97316" },
  ]);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calendar</h2>
<<<<<<< HEAD
        <Button variant="outline">+ Add Event</Button>
=======
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991
      </div>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventContent={(eventInfo) => (
          <span
            className="px-2 py-1 rounded text-white mf"
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

export default StudentCalendar;