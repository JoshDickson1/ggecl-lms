import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FaBook } from "react-icons/fa";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { parseISO, format } from "date-fns";
import { useStudent } from "@/hooks/useStudent";

// Dummy data
const assignmentsOverview = [
  { id: 1, title: "Project Proposal", dueDate: "2024-05-01", graded: false },
  { id: 2, title: "UX Case Study", dueDate: "2024-04-25", graded: true, grade: "A-" },
];

const myClassroom = {
  id: 101,
  name: "UX Design Classroom",
  description: "Weekly lessons and discussions about UX design.",
};

const myClassroomGroup = {
  id: 201,
  name: "Group A - UX Fundamentals",
  members: 5,
};

const recentUploads = [
  { id: 1, title: "UX Design Guidelines.pdf", date: "2024-04-17" },
  { id: 2, title: "Case Study Video.mp4", date: "2024-04-16" },
];

const StudentHome = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progress, setProgress] = useState(0);

  const enrolledCourses = [
    {
      id: 1,
      title: "User Experience (UX) Design",
      lessons: 5,
      progress: 65,
      active: true,
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
          You have {assignmentsOverview.length} upcoming assignments and {recentUploads.length} new resources
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Current Course Progress</span>
                  <span className="text-primary text-sm">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Enrolled Courses</h3>
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="rounded-lg border p-4 max-h-72">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{course.title}</h4>
                        <div className="text-muted-foreground mt-1 flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <FaBook className="h-4 w-4" /> {course.lessons} lessons
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

          {/* Assignments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assignments Overview</CardTitle>
              <Link to="/student/dashboard/assignment">
                <Button variant="link" className="text-sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {assignmentsOverview.map(({ id, title, dueDate, graded, grade }) => (
                <div key={id} className="flex justify-between items-center rounded-md p-2 bg-muted mb-2">
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {format(parseISO(dueDate), "MMM d, yyyy")}
                    </p>
                  </div>
                  {graded ? (
                    <Badge>Graded: {grade}</Badge>
                  ) : (
                    <Badge variant="default">Pending</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Uploads */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Recent Uploads & Materials</CardTitle>
              <Link to="/student/resources">
                <Button variant="link" className="text-sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2 max-h-48 overflow-y-auto">
              {recentUploads.map(({ id, title, date }) => (
                <div key={id} className="bg-muted rounded-md p-2">
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(date), "MMM d, yyyy")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's date</CardTitle>
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

          {/* Classroom */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>My Classroom</CardTitle>
              <Link to={`/student/classroom/${myClassroom.id}`}>
                <Button variant="link" className="text-sm">Open</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{myClassroom.name}</p>
              <p className="text-muted-foreground">{myClassroom.description}</p>
            </CardContent>
          </Card>

          {/* Classroom Group */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>My Classroom Group</CardTitle>
              <Link to={`/student/groups/${myClassroomGroup.id}`}>
                <Button variant="link" className="text-sm">Open</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{myClassroomGroup.name}</p>
              <p className="text-muted-foreground">{myClassroomGroup.members} members</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
