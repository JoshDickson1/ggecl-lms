'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
type Group = {
  id: number;
  name: string;
  createdAt: Date;
  image: string;
  instructor: string;
  students: string[];
  description: string;
  classroomId: string | number;
};
type Classroom = {
  id: string;
  name: string;
  instructor: string;
  students: string[];
};
type GroupCompProps = {
  classGroups: Group[];
  setClassGroups: React.Dispatch<React.SetStateAction<Group[]>>;
};
const dummyClassrooms: Classroom[] = [
  {
    id: 'cls1',
    name: 'Frontend Dev',
    instructor: 'John Doe',
    students: ['Alice', 'Bob', 'Charlie'],
  },
  {
    id: 'cls2',
    name: 'Backend Dev',
    instructor: 'Jane Smith',
    students: ['Dave', 'Eva', 'Frank'],
  },
];
const GroupComp: React.FC<GroupCompProps> = ({
  classGroups,
  setClassGroups,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const handleNewGroup = () => {
    setCurrentGroup({
      id: Math.floor(Math.random() * 10000),
      name: '',
      students: [],
      createdAt: new Date(),
      image: '',
      instructor: '',
      description: '',
      classroomId: '',
    });
    setSelectedClassroomId('');
    setDialogOpen(true);
  };
  const saveGroup = () => {
    if (!currentGroup || !currentGroup.name || !currentGroup.classroomId)
      return;
    setClassGroups((prev) => [...prev, currentGroup]);
    setDialogOpen(false);
  };
  const availableStudents =
    dummyClassrooms.find((c) => c.id === selectedClassroomId)?.students || [];
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-left">
        <Button onClick={handleNewGroup}>Create Group</Button>
        <h2 className="text-md font-semibold">Group Management Panel</h2>
      </div>
      {classGroups.map((group) => (
        <div
          key={group.id}
          className="bg-gray-100 p-2 rounded dark:bg-gray-800 flex justify-between items-center"
        >
          <div>
            <p className="text-sm font-medium">{group.name}</p>
            <p className="text-xs text-muted-foreground">
              Students: {group.students}
            </p>
            <p className="text-xs text-muted-foreground">
              Instructor: {group.instructor}
            </p>
          </div>
        </div>
      ))}
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Group</DialogTitle>
    </DialogHeader>
    {currentGroup && (
      <div className="space-y-4">
        <Input
          placeholder="Group Name"
          value={currentGroup.name}
          onChange={(e) =>
            setCurrentGroup({ ...currentGroup, name: e.target.value })
          }
        />
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Existing Groups</h3>
          {classGroups.map((group) => (
            <div
              key={group.id}
              className="bg-gray-100 p-2 rounded dark:bg-gray-800 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{group.name}</p>
                <p className="text-xs text-muted-foreground">
                  Students: {group.students.join(', ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Instructor: {group.instructor}
                </p>
              </div>
            </div>
          ))}
        </div>
        {selectedClassroomId && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Select Students</p>
            {availableStudents.map((student) => (
              <div key={student} className="flex items-center space-x-2">
                <Checkbox
                  checked={currentGroup.students.includes(student)}
                  onCheckedChange={(checked) =>
                    setCurrentGroup((prev) => {
                      if (!prev) return prev;
                      const newStudents = checked
                        ? [...prev.students, student]
                        : prev.students.filter((s) => s !== student);
                      return { ...prev, students: newStudents };
                    })
                  }
                />
                <span className="text-sm">{student}</span>
              </div>
            ))}
          </div>
        )}
        <Button
          onClick={saveGroup}
          disabled={!selectedClassroomId || !currentGroup.name}
        >
          Save Group
        </Button>
      </div>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
};

export default GroupComp;
