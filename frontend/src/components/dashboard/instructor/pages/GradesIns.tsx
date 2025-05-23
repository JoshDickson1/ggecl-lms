import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const assignmentGrades = [
  {
    id: 1,
    student: "John Doe",
    markedBy: "Mrs. Smith",
    course: "Mathematics",
    date: "2025-05-10",
    time: "10:30 AM",
    grade: "A",
    remarks: "Excellent work",
  },
  {
    id: 2,
    student: "Jane Uche",
    markedBy: "Admin - Mr. Daniel",
    course: "English",
    date: "2025-05-12",
    time: "12:00 PM",
    grade: "B+",
    remarks: "Good effort",
  },
];

const groupGrades = [
  {
    id: 1,
    groupName: "Frontend Devs",
    course: "Web Design",
    date: "2025-05-14",
    time: "02:15 PM",
    students: [
      {
        id: "s1",
        name: "Samuel Joe",
        markedBy: "Mrs. Violet",
        grade: "A",
        remarks: "Solid design approach",
      },
      {
        id: "s2",
        name: "Mary Jane",
        markedBy: "Mrs. Violet",
        grade: "A-",
        remarks: "Neat and responsive layout",
      },
    ],
  },
  {
    id: 2,
    groupName: "Backend Squad",
    course: "Database Systems",
    date: "2025-05-16",
    time: "04:45 PM",
    students: [
      {
        id: "s3",
        name: "Chris Obi",
        markedBy: "Admin - Mr. Daniel",
        grade: "B",
        remarks: "Meets basic requirements",
      },
    ],
  },
];

const GradesIns = () => {
  return (
    <div className="space-y-10 p-2 md:p-4">
      <h1 className="text-3xl font-bold">Grades Overview</h1>

      {/* Assignment Grades */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Assignment Grades</h2>
        <div className="overflow-x-auto shadow-sm md:rounded-xl md:border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Marked By</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignmentGrades.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.student}</TableCell>
                  <TableCell>{item.markedBy}</TableCell>
                  <TableCell>{item.course}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.time}</TableCell>
                  <TableCell>
                    <Badge className="bg-gray-800 dark:text-white">
                      {item.grade}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Group Grades */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Group Grades</h2>
        {groupGrades.map((group) => (
          <div
            key={group.id}
            className="space-y-2 overflow-x-auto md:rounded-xl md:border shadow-sm"
          >
            <div className="flex justify-between dark:bg-gray-800 p-2 font-medium">
              <span>
                {group.groupName} - {group.course}
              </span>
              <span>
                {group.date} • {group.time}
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Marked By</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.markedBy}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700">
                        {student.grade}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </section>
    </div>
  );
};

export default GradesIns;
