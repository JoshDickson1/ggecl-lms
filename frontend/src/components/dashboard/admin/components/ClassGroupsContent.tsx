interface ClassGroupsContentProps {
  classGroups: {
    id: number;
    name: string;
    createdAt: Date;
    image: string;
    instructor: string;
    students: string[];
  }[];
}

export const ClassGroupsContent: React.FC<ClassGroupsContentProps> = ({ classGroups }) => {
  return (
    <div>
      {classGroups.map((group) => (
        <div key={group.id}>
          <h3>{group.name}</h3>
          <p>{group.instructor}</p>
          <p>{group.students}</p>
          {/* Render more details */}
        </div>
      ))}
    </div>
  );
};
