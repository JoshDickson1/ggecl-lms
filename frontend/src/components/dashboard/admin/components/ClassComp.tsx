"use client";

import { useState } from "react";
import { Plus, MoreVertical, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { MultiSelect } from "./multiselect.tsx"; // Ensure this exists or replace with another multiselect
import { ClassGroup } from "@/types/classGroupTypes.ts";

const instructors = ["Alice", "Bob", "Charlie"];
const students = ["John", "Jane", "Jim", "Julia"];

type Props = {
  classGroups: ClassGroup[]; // Add classGroups prop
  setClassGroups: React.Dispatch<React.SetStateAction<ClassGroup[]>>; // Add setClassGroups prop
  activeChatId: number | null; // Add activeChatId prop
  onSelectGroup: (id: number) => void; // Add onSelectGroup prop
};

export default function ClassComp({
  onSelectGroup,
  activeChatId,
  classGroups,
  setClassGroups,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editGroupId, setEditGroupId] = useState<number | null>(null);

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [groupImage, setGroupImage] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const resetForm = () => {
    setGroupName("");
    setGroupImage("");
    setSelectedInstructor("");
    setSelectedStudents([]);
    setEditGroupId(null);
    setIsEdit(false);
  };

  const handleSaveGroup = () => {
    if (!groupName || !selectedInstructor) return;

    const newGroup: ClassGroup = {
      id: editGroupId ?? Date.now(),
      name: groupName,
      createdAt:
        editGroupId && classGroups.find((g) => g.id === editGroupId)?.createdAt
          ? classGroups.find((g) => g.id === editGroupId)!.createdAt
          : new Date(),
      image: groupImage || "/default-group.png",
      instructor: selectedInstructor,
      students: selectedStudents,
      description: description,
    };

    if (editGroupId) {
      setClassGroups((prev) =>
        prev.map((group) => (group.id === editGroupId ? newGroup : group)),
      );
    } else {
      setClassGroups((prev) => [newGroup, ...prev]);
    }

    setIsOpen(false);
    resetForm();
  };

  const handleEditGroup = (group: ClassGroup) => {
    setIsEdit(true);
    setEditGroupId(group.id);
    setGroupName(group.name);
    setGroupImage(group.image);
    setSelectedInstructor(group.instructor);
    setSelectedStudents(group.students);
    setIsOpen(true);
  };

  const handleDeleteGroup = (id: number) => {
    setClassGroups((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-4">
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button className="w-full justify-between bg-blue-500 text-white hover:bg-blue-700">
            <span>{isEdit ? "Edit Class" : "Create Class"}</span>
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Class" : "Create New Class"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter class name"
              />
            </div>
            <div>
              <Label htmlFor="group-des">Group Description</Label>
              <Input
                id="group-des"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter class description"
              />
            </div>

            <div>
              <Label htmlFor="group-image">Group Image URL</Label>
              <Input
                id="group-image"
                value={groupImage}
                onChange={(e) => setGroupImage(e.target.value)}
                placeholder="Enter image URL"
              />
            </div>

            <div>
              <Label>Instructor</Label>
              <Select
                onValueChange={setSelectedInstructor}
                value={selectedInstructor}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((inst) => (
                    <SelectItem key={inst} value={inst}>
                      {inst}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Students</Label>
              <MultiSelect
                options={students}
                selected={selectedStudents}
                onChange={setSelectedStudents}
                placeholder="Select students"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSaveGroup} className="mt-4 w-full">
              {isEdit ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="loi max-h-90 overflow-y-auto">
        <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Created Classes
        </p>

        <div className="space-y-3">
          {classGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 ${activeChatId === group.id ? "bg-blue-100 dark:bg-blue-900" : "bg-white dark:bg-gray-800"} relative shadow-sm transition hover:shadow-md`}
            >
              <div className="h-10 w-10 overflow-hidden rounded-full border">
                <img
                  src={group.image}
                  alt={group.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {group.name}
                </p>
                <p className="text-xs text-gray-500 lowercase">
                  {format(group.createdAt, "MMMM dd, yyyy")}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleEditGroup(group)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
