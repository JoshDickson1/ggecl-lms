type GroupCompProps = {
  classGroups: {
    id: number;
    name: string;
    createdAt: Date;
    image: string;
    instructor: string;
    students: string[];
  }[];
  setClassGroups: React.Dispatch<React.SetStateAction<any[]>>;
};

const GroupComp: React.FC<GroupCompProps> = ({ classGroups }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Group Management Panel</h2>
      {/* Example content */}
      {classGroups.map((group) => (
        <div key={group.id} className="bg-gray-100 p-2 rounded dark:bg-gray-800">
          <p className="text-sm font-medium">{group.name}</p>
        </div>
      ))}
    </div>
  );
};

export default GroupComp;
