import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { MultiSelect } from './multiselect.tsx'; // Custom multiselect (create or import as needed)

const instructors = ['Alice', 'Bob', 'Charlie'];
const students = ['John', 'Jane', 'Jim', 'Julia'];

export default function ClassComp() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [groupImage, setGroupImage] = useState('');
  const [editGroupId, setEditGroupId] = useState<number | null>(null);

  const [classGroups, setClassGroups] = useState([
    { id: 1, name: 'Class 1', createdAt: new Date(), image: 'https://i.pinimg.com/736x/32/60/dc/3260dc3b3034bd82b1caef506ae0b8e0.jpg', instructor: 'Alice', students: ['John', 'Jane'] },
    { id: 2, name: 'Class 2', createdAt: new Date(), image: 'https://i.pinimg.com/736x/32/60/dc/3260dc3b3034bd82b1caef506ae0b8e0.jpg', instructor: 'Bob', students: ['Jim'] },
  ]);

  const resetForm = () => {
    setGroupName('');
    setSelectedInstructor('');
    setSelectedStudents([]);
    setGroupImage('');
    setEditGroupId(null);
  };

  const handleCreateOrUpdateGroup = () => {
    if (!groupName || !selectedInstructor) return;

    const newGroup = {
      id: editGroupId ?? Date.now(),
      name: groupName,
      createdAt: editGroupId
        ? classGroups.find((g) => g.id === editGroupId)?.createdAt || new Date()
        : new Date(),
      image: groupImage || '/default-group.png',
      instructor: selectedInstructor,
      students: selectedStudents,
    };

    if (editGroupId) {
      setClassGroups((prev) =>
        prev.map((g) => (g.id === editGroupId ? newGroup : g))
      );
    } else {
      setClassGroups([newGroup, ...classGroups]);
    }

    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (group: any) => {
    setEditGroupId(group.id);
    setGroupName(group.name);
    setGroupImage(group.image);
    setSelectedInstructor(group.instructor);
    setSelectedStudents(group.students);
    setIsOpen(true);
    setIsEdit(true);
  };

  const handleDelete = (id: number) => {
    setClassGroups((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetForm();
          setIsEdit(false);
        }
      }}>
        <DialogTrigger asChild>
          <Button className="bg-blue-500 hover:bg-blue-700 text-white w-full justify-between">
            <span>{isEdit ? 'Edit Class' : 'Create Class'}</span>
            <Plus />
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Class' : 'Create New Class'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter class name"
            />

            <Label htmlFor="group-image">Group Image URL</Label>
            <Input
              id="group-image"
              value={groupImage}
              onChange={(e) => setGroupImage(e.target.value)}
              placeholder="Enter image URL"
            />

            <Label>Instructor</Label>
            <Select onValueChange={setSelectedInstructor} value={selectedInstructor}>
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

            <Label>Students</Label>
            <MultiSelect
              options={students}
              selected={selectedStudents}
              onChange={setSelectedStudents}
              placeholder="Select students"
            />
          </div>

          <DialogFooter>
            <Button onClick={handleCreateOrUpdateGroup} className="w-full mt-4">
              {isEdit ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="overflow-y-scroll max-h-80 loi">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Created Classes</p>
  
        <div className="space-y-3">
          {classGroups.map((group) => (
            <div
              key={group.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition relative"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border">
                <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{group.name}</p>
                <p className="text-xs text-gray-500 lowercase">
                  {format(group.createdAt, 'MMMM dd, yyyy')}
                </p>
              </div>
  
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleEdit(group)}>
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(group.id)} className="text-red-500">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
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
