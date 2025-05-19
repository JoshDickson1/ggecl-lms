'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

type Group = {
  id: number;
  name: string;
  createdAt: Date;
  image: string;
  instructor: string;
  students: string[];
};

type GroupCompProps = {
  classGroups: Group[];
  setClassGroups: React.Dispatch<React.SetStateAction<Group[]>>;
};

const GroupComp: React.FC<GroupCompProps> = ({ classGroups, setClassGroups }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const allStudents = Array.from(new Set(classGroups.flatMap(group => group.students)));

  // const assignedStudents = new Set(classGroups.flatMap(g => g.students));

  const handleEdit = (group: Group) => {
    setCurrentGroup(group);
    setDialogOpen(true);
  };

  const handleDelete = (groupId: number) => {
    setClassGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const handleCreate = (template: Group) => {
    setCurrentGroup({
      ...template,
      id: Math.floor(Math.random() * 10000),
      name: '',
      students: [],
      createdAt: new Date(),
    });
    setDialogOpen(true);
  };

  const saveGroup = () => {
    if (!currentGroup) return;
    setClassGroups(prev => {
      const exists = prev.find(g => g.id === currentGroup.id);
      if (exists) {
        return prev.map(g => (g.id === currentGroup.id ? currentGroup : g));
      }
      return [...prev, currentGroup];
    });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Group Management Panel</h2>
      {classGroups.map((group) => (
        <div key={group.id} className="bg-gray-100 p-2 rounded dark:bg-gray-800 flex justify-between items-center">
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
              <DropdownMenuItem onClick={() => handleEdit(group)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(group.id)}>Delete</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreate(group)}>Create Group</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentGroup?.id ? 'Edit Group' : 'Create Group'}</DialogTitle>
          </DialogHeader>
          {currentGroup && (
            <div className="space-y-4">
              <Input
                placeholder="Group Name"
                value={currentGroup.name}
                onChange={(e) => setCurrentGroup({ ...currentGroup, name: e.target.value })}
              />
              <div>
                <p className="text-sm font-medium">Instructor</p>
                <p className="text-sm text-muted-foreground">{currentGroup.instructor}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Students</p>
                {allStudents.map((student) => {
                  const alreadyAssigned = classGroups.some(g => g.id !== currentGroup.id && g.students.includes(student));
                  return (
                    <div key={student} className="flex items-center space-x-2">
                      <Checkbox
                        checked={currentGroup.students.includes(student)}
                        disabled={alreadyAssigned}
                        onCheckedChange={(checked) => {
                          const updated = checked
                            ? [...currentGroup.students, student]
                            : currentGroup.students.filter(s => s !== student);
                          setCurrentGroup({ ...currentGroup, students: updated });
                        }}
                      />
                      <span className={`text-sm ${alreadyAssigned ? 'text-muted-foreground line-through' : ''}`}>
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

export default GroupComp;
