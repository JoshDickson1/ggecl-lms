// components/ClassGroupsContent.tsx
'use client';

type Group = {
  id: string;
  name: string;
  classroomId: string;
  students: string[];
};

type Props = {
  group: Group | null;
};

const ClassGroupsContent = ({ group }: Props) => {
  if (!group) return <div>Select a group to view details.</div>;

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-bold">{group.name}</h2>
      <p><strong>Classroom ID:</strong> {group.classroomId}</p>
      <p><strong>Students:</strong> {group.students.join(', ')}</p>
    </div>
  );
};

export default ClassGroupsContent;
