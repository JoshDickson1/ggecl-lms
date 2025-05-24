'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreVertical } from 'lucide-react';

type Group = {
  id: number;
  name: string;
  createdAt: Date;
  image: string;
  instructor: string;
  students: string[];
};

type Classroom = {
  id: number;
  name: string;
  instructor: string;
  students: string[];
  groups: Group[];
};

type Props = {
  classrooms: Classroom[];
  setClassrooms: React.Dispatch<React.SetStateAction<Classroom[]>>;
};

const ClassroomGroups: React.FC<Props> = ({ classrooms, setClassrooms }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  const openCreateDialog = (classroomId: number) => {
    const classroom = classrooms.find(c => c.id === classroomId);
    if (!classroom) return;

    setCurrentGroup({
      id: Math.floor(Math.random() * 100000),
      name: '',
      image: '',
      createdAt: new Date(),
      instructor: classroom.instructor,
      students: [],
    });
    setSelectedClassroomId(classroomId);
    setDialogOpen(true);
  };

  const openEditDialog = (classroomId: number, group: Group) => {
    setCurrentGroup(group);
    setSelectedClassroomId(classroomId);
    setDialogOpen(true);
  };

  const handleDeleteGroup = (classroomId: number, groupId: number) => {
    setClassrooms(prev =>
      prev.map(c =>
        c.id === classroomId
          ? { ...c, groups: c.groups.filter(g => g.id !== groupId) }
          : c
      )
    );
  };

  const saveGroup = () => {
    if (!currentGroup || selectedClassroomId === null) return;

    setClassrooms(prev =>
      prev.map(c => {
        if (c.id !== selectedClassroomId) return c;

        const exists = c.groups.find(g => g.id === currentGroup.id);
        if (exists) {
          return {
            ...c,
            groups: c.groups.map(g =>
              g.id === currentGroup.id ? currentGroup : g
            ),
          };
        }

        return {
          ...c,
          groups: [...c.groups, currentGroup],
        };
      })
    );

    setDialogOpen(false);
    setCurrentGroup(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Classroom Groups</h2>
      <Accordion type="multiple">
        {classrooms.map(classroom => {
          // const assignedStudents = new Set(
          //   classroom.groups.flatMap(g => g.students)
          // );

          return (
            <AccordionItem value={`classroom-${classroom.id}`} key={classroom.id}>
              <AccordionTrigger className="justify-between pr-2">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{classroom.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openCreateDialog(classroom.id)}>
                        Create Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-4 space-y-2">
                {classroom.groups.map(group => (
                  <div
                    key={group.id}
                    className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-medium">{group.name}</p>
                      <p className="text-xs text-muted-foreground">Instructor: {group.instructor}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openEditDialog(classroom.id, group)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteGroup(classroom.id, group.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentGroup?.id ? 'Edit Group' : 'Create Group'}</DialogTitle>
          </DialogHeader>
          {currentGroup && selectedClassroomId !== null && (
            <div className="space-y-4">
              <Input
                placeholder="Group Name"
                value={currentGroup.name}
                onChange={(e) =>
                  setCurrentGroup({ ...currentGroup, name: e.target.value })
                }
              />
              <div>
                <p className="text-sm font-medium">Instructor</p>
                <p className="text-sm text-muted-foreground">
                  {
                    classrooms.find(c => c.id === selectedClassroomId)?.instructor
                  }
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Students</p>
                {classrooms
                  .find(c => c.id === selectedClassroomId)
                  ?.students.map(student => {
                    const alreadyAssigned = classrooms
                      .find(c => c.id === selectedClassroomId)
                      ?.groups.some(
                        g => g.id !== currentGroup.id && g.students.includes(student)
                      );

                    return (
                      <div key={student} className="flex items-center space-x-2">
                        <Checkbox
                          checked={currentGroup.students.includes(student)}
                          disabled={alreadyAssigned}
                          onCheckedChange={checked => {
                            const updated = checked
                              ? [...currentGroup.students, student]
                              : currentGroup.students.filter(s => s !== student);
                            setCurrentGroup({ ...currentGroup, students: updated });
                          }}
                        />
                        <span
                          className={`text-sm ${
                            alreadyAssigned ? 'text-muted-foreground line-through' : ''
                          }`}
                        >
                          {student}
                        </span>
                      </div>
                    );
                  })}
              </div>
              <Button onClick={saveGroup}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassroomGroups;
