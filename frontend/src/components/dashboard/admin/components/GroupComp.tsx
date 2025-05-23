"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// Dummy data for instructors and students
const DUMMY_INSTRUCTORS = [
  "Dr. Smith",
  "Prof. Johnson",
  "Ms. Williams",
  "Mr. Brown",
];
const DUMMY_STUDENTS = [
  "Alice Johnson",
  "Bob Smith",
  "Charlie Brown",
  "Diana Prince",
  "Ethan Hunt",
  "Fiona Green",
];

type Group = {
  id: number;
  name: string;
  createdAt: Date;
  image: string;
  instructor: string;
  students: string[];
  description: string;
  subGroups?: Group[];
};

type GroupCompProps = {
  classGroups: Group[];
  setClassGroups: React.Dispatch<React.SetStateAction<Group[]>>;
};

const GroupComp: React.FC<GroupCompProps> = ({
  classGroups,
  setClassGroups,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [targetParentGroup, setTargetParentGroup] = useState<Group | null>(
    null,
  );
  const [imageUrl, setImageUrl] = useState("");

  const handleEdit = (group: Group) => {
    setCurrentGroup(group);
    setImageUrl(group.image);
    setDialogOpen(true);
  };

  const handleDelete = (groupId: number) => {
    setClassGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleCreate = (parentGroup: Group) => {
    setCurrentGroup({
      id: Math.floor(Math.random() * 1000000),
      name: "",
      createdAt: new Date(),
      image: "",
      instructor: "",
      students: [],
      description: "",
    });
    setImageUrl("");
    setTargetParentGroup(parentGroup);
    setDialogOpen(true);
  };

  const saveGroup = () => {
    if (!currentGroup) return;

    const updatedGroup = {
      ...currentGroup,
      image: imageUrl,
    };

    if (targetParentGroup) {
      // Creating/editing a subgroup
      setClassGroups((prev) =>
        prev.map((group) => {
          if (group.id !== targetParentGroup.id) return group;

          const existingSubGroups = group.subGroups || [];

          const subGroupExists = existingSubGroups.some(
            (sub) => sub.id === updatedGroup.id,
          );

          const updatedSubGroups = subGroupExists
            ? existingSubGroups.map((sub) =>
                sub.id === updatedGroup.id ? updatedGroup : sub,
              )
            : [...existingSubGroups, updatedGroup];

          return {
            ...group,
            subGroups: updatedSubGroups,
          };
        }),
      );
    } else {
      // Creating/editing a main group
      const groupExists = classGroups.some((g) => g.id === updatedGroup.id);
      setClassGroups((prev) =>
        groupExists
          ? prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
          : [...prev, updatedGroup],
      );
    }

    setDialogOpen(false);
    setTargetParentGroup(null);
  };

  const renderGroup = (group: Group, isSubgroup = false) => (
    <div
      key={group.id}
      className={`flex items-center justify-between rounded bg-gray-100 p-2 dark:bg-gray-800 ${isSubgroup ? "mt-2 ml-4" : ""}`}
    >
      <div className="flex items-center space-x-2">
        {group.image ? (
          <img
            src={group.image}
            alt={group.name}
            className="h-10 w-10 rounded-full border border-gray-300 object-cover dark:border-gray-600"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-200 dark:border-gray-600 dark:bg-gray-700">
            <ImageIcon className="h-4 w-4 text-gray-500" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium">{group.name}</p>
          <p className="text-muted-foreground text-xs">
            Instructor: {group.instructor || "Not assigned"}
          </p>
          <p className="text-muted-foreground text-xs">
            Students: {group.students.length}
          </p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleEdit(group)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDelete(group.id)}>
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCreate(group)}>
            Create Subgroup
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="space-y-4">
      {classGroups.map((group) => (
        <div key={group.id} className="space-y-2">
          {renderGroup(group)}
        </div>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentGroup?.id ? "Edit Group" : "Create Group"}
            </DialogTitle>
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
              <Input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-20 w-20 rounded object-cover"
                />
              )}
              <div className="space-y-2">
                <p className="text-sm font-medium">Instructor</p>
                <select
                  className="w-full rounded border p-2 text-sm"
                  value={currentGroup.instructor}
                  onChange={(e) =>
                    setCurrentGroup({
                      ...currentGroup,
                      instructor: e.target.value,
                    })
                  }
                >
                  <option value="">Select Instructor</option>
                  {DUMMY_INSTRUCTORS.map((instructor) => (
                    <option key={instructor} value={instructor}>
                      {instructor}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Students</p>
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {DUMMY_STUDENTS.map((student) => {
                    const alreadyAssigned = classGroups.some(
                      (g) =>
                        g.id !== currentGroup.id &&
                        g.students.includes(student),
                    );
                    return (
                      <div
                        key={student}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`student-${student}`}
                          checked={currentGroup.students.includes(student)}
                          disabled={alreadyAssigned}
                          onCheckedChange={(checked) => {
                            const updated = checked
                              ? [...currentGroup.students, student]
                              : currentGroup.students.filter(
                                  (s) => s !== student,
                                );
                            setCurrentGroup({
                              ...currentGroup,
                              students: updated,
                            });
                          }}
                        />
                        <label
                          htmlFor={`student-${student}`}
                          className={`text-sm ${alreadyAssigned ? "text-muted-foreground line-through" : ""}`}
                        >
                          {student}
                        </label>
                      </div>
                    );
                  })}
                </div>
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
