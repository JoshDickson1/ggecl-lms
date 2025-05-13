import React, { useState } from "react";

interface Student {
  id: number;
  name: string;
  grade: string;
  email: string;
  course: string;
}

const Grading: React.FC = () => {
  // Placeholder data for students with additional information
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "John Doe", grade: "A", email: "john@example.com", course: "Math 101" },
    { id: 2, name: "Jane Smith", grade: "B", email: "jane@example.com", course: "Physics 201" },
    { id: 3, name: "Alice Johnson", grade: "C", email: "alice@example.com", course: "Chemistry 301" },
  ]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newGrade, setNewGrade] = useState<string>("");
  const [newStudent, setNewStudent] = useState<Student>({
    id: 0,
    name: "",
    grade: "A",
    email: "",
    course: "",
  });

  const handleGradeChange = (student: Student) => {
    setSelectedStudent(student);
    setNewGrade(student.grade);
  };

  const handleSaveGrade = () => {
    if (selectedStudent) {
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === selectedStudent.id
            ? { ...student, grade: newGrade }
            : student
        )
      );
      setSelectedStudent(null);
      setNewGrade("");
    }
  };

  const handleDeleteStudent = (id: number) => {
    setStudents(students.filter(student => student.id !== id));
  };

  const handleAddStudent = () => {
    setStudents((prevStudents) => [...prevStudents, { ...newStudent, id: Date.now() }]);
    setNewStudent({ id: 0, name: "", grade: "A", email: "", course: "" });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-md space-y-8">
      <h1 className="text-4xl font-semibold text-center text-gray-700">Instructor Grading Page</h1>
      
      {/* New Student Form */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-medium text-gray-800 mb-4">Add New Student</h2>
        <input
          className="w-full p-3 mb-3 border border-gray-300 rounded-md"
          type="text"
          placeholder="Name"
          value={newStudent.name}
          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
        />
        <input
          className="w-full p-3 mb-3 border border-gray-300 rounded-md"
          type="email"
          placeholder="Email"
          value={newStudent.email}
          onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
        />
        <input
          className="w-full p-3 mb-3 border border-gray-300 rounded-md"
          type="text"
          placeholder="Course"
          value={newStudent.course}
          onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })}
        />
        <select
          className="w-full p-3 mb-3 border border-gray-300 rounded-md"
          value={newStudent.grade}
          onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="F">F</option>
        </select>
        <button
          className="w-full p-3 mt-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          onClick={handleAddStudent}
        >
          Add Student
        </button>
      </div>

      {/* Students Table */}
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-4 text-sm font-medium text-gray-600">ID</th>
            <th className="p-4 text-sm font-medium text-gray-600">Name</th>
            <th className="p-4 text-sm font-medium text-gray-600">Grade</th>
            <th className="p-4 text-sm font-medium text-gray-600">Course</th>
            <th className="p-4 text-sm font-medium text-gray-600">Email</th>
            <th className="p-4 text-sm font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-t border-gray-200">
              <td className="p-4 text-sm text-gray-700">{student.id}</td>
              <td className="p-4 text-sm text-gray-700">{student.name}</td>
              <td className="p-4 text-sm text-gray-700">{student.grade}</td>
              <td className="p-4 text-sm text-gray-700">{student.course}</td>
              <td className="p-4 text-sm text-gray-700">{student.email}</td>
              <td className="p-4 text-sm text-gray-700 flex space-x-2">
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition"
                  onClick={() => handleGradeChange(student)}
                >
                  Update Grade
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                  onClick={() => handleDeleteStudent(student.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Update Grade Section */}
      {selectedStudent && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-2xl font-medium text-gray-800 mb-4">Update Grade for {selectedStudent.name}</h2>
          <input
            className="w-full p-3 mb-3 border border-gray-300 rounded-md"
            type="text"
            value={newGrade}
            onChange={(e) => setNewGrade(e.target.value)}
          />
          <div className="flex space-x-4">
            <button
              className="w-full p-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
              onClick={handleSaveGrade}
            >
              Save
            </button>
            <button
              className="w-full p-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
              onClick={() => setSelectedStudent(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grading;
