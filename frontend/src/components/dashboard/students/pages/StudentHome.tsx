import { useEffect, useState } from "react";
import { FaClock, FaBook } from "react-icons/fa";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { parseISO, format, isValid } from "date-fns";
import { useStudent } from "@/hooks/useStudent";

// Type definitions
interface EnrolledCourse {
  id: number;
  title: string;
  duration: string;
  lessons: number;
  progress: number;
  active: boolean;
}

interface UpcomingLesson {
  id: number;
  title: string;
  time: string;
  date: string;
  duration: string;
}

interface TaskItemProps {
  title: string;
  dueDate: string;
}

const StudentHome = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progress, setProgress] = useState(0);

  const enrolledCourses: EnrolledCourse[] = [
    {
      id: 1,
      title: "User Experience (UX) Design",
      duration: "5.5 hours",
      lessons: 5,
      progress: 65,
      active: true,
    },
  ];

  const upcomingLessons: UpcomingLesson[] = [
    {
      id: 1,
      title: "UX Design Fundamentals",
      time: "17:30",
      date: "2024-03-25",
      duration: "90 mins",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setProgress(65), 500);
    return () => clearTimeout(timer);
  }, []);

  const { student } = useStudent();

  const firstName = student.fullName.split(" ")[1] || "Student";

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, <span className="capitalize">{firstName}</span>
        </h1>
        <p className="text-muted-foreground">
          You have 3 upcoming assignments and 2 new resources
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">
                  Current Course Progress
                </span>
                <span className="text-primary text-sm">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">Enrolled Courses</h3>
              {enrolledCourses.map((course) => (
                <div key={course.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <div className="text-muted-foreground mt-1 flex gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <FaClock className="h-4 w-4" /> {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaBook className="h-4 w-4" /> {course.lessons}{" "}
                          lessons
                        </span>
                      </div>
                    </div>
                    <Badge variant={course.active ? "default" : "secondary"}>
                      {course.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="mx-auto">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Lessons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingLessons.map((lesson) => {
                const parsedDate = parseISO(lesson.date);
                const formattedDate = isValid(parsedDate)
                  ? format(parsedDate, "MMM d, yyyy")
                  : "Invalid date";
                return (
                  <div
                    key={lesson.id}
                    className="bg-muted flex items-center justify-between rounded-md p-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{lesson.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {formattedDate} at {lesson.time}
                      </p>
                    </div>
                    <Button
                      className="border-border"
                      size="sm"
                      variant="outline"
                    >
                      Join
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Academic Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="font-medium">Priority Tasks</h3>
            <div className="space-y-2">
              <TaskItem title="Submit Final Project" dueDate="2024-04-15" />
              <TaskItem title="Peer Review Submission" dueDate="2024-04-10" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TaskItem = ({ title, dueDate }: TaskItemProps) => {
  const parsedDueDate = parseISO(dueDate);
  const formattedDueDate = isValid(parsedDueDate)
    ? format(parsedDueDate, "MMM d, yyyy")
    : "Invalid date";

  return (
    <div className="bg-muted flex items-center justify-between rounded p-2">
      <span className="text-sm font-semibold">{title}</span>
      <Badge variant="secondary" className="bg-secondary">
        {formattedDueDate}
      </Badge>
    </div>
  );
};

export default StudentHome;
