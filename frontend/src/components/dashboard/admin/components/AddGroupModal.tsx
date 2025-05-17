'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MultiSelect } from './multiselect';
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from '@/components/ui/select';

type Classroom = {
  id: string;
  name: string;
  instructor: string;
  students: string[];
};

type Group = {
  id: number;
  name: string;
  classroomId: string;
  instructor: string;
  students: string[];
  createdAt: Date;
  image: string;
};

type Props = {
  classrooms: Classroom[];
  classGroups: Group[]; // Uncommented and added type
  onClose: () => void;
  onSave: (newGroup: Group) => void;
};

export default function AddGroupModal({ classrooms, classGroups, onClose, onSave }: Props) {
  const [groupName, setGroupName] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const selectedClassroom = classrooms.find((c) => c.id === classroomId);

  // Exclude students already assigned to other groups in the selected classroom
  const assignedStudents = classGroups
    .filter((group: Group) => group.classroomId === classroomId) // Explicitly typed `group`
    .flatMap((group: Group) => group.students); // Explicitly typed `group`

  const availableStudents =
    selectedClassroom?.students.filter((student) => !assignedStudents.includes(student)) || [];

  const handleSubmit = () => {
    if (!groupName || !classroomId || selectedStudents.length === 0) return;

    const newGroup: Group = {
      id: Date.now(),
      name: groupName,
      classroomId,
      instructor: selectedClassroom?.instructor || '',
      students: selectedStudents,
      createdAt: new Date(),
      image: '/default-group.png', // Default image for the group
    };

    onSave(newGroup);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setGroupName('');
    setClassroomId('');
    setSelectedStudents([]);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Group(s)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Group Name</Label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>

          <div>
            <Label>Classroom</Label>
            <Select value={classroomId} onValueChange={setClassroomId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a classroom" />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map((classroom) => (
                  <SelectItem key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Instructor</Label>
            <p className="text-sm">{selectedClassroom?.instructor || 'Select a classroom first'}</p>
          </div>

          <div>
            <Label>Students</Label>
            <MultiSelect
              options={availableStudents}
              selected={selectedStudents}
              onChange={setSelectedStudents}
              placeholder="Select students"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full mt-2">
            Save Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}