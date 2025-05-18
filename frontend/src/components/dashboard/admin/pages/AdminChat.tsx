import { useState } from 'react';
import SidebarM from '../components/SidebarM';
import ClassroomContent from '../components/ClassroomContent';
// import { ClassGroupsContent } from '../components/ClassGroupsContent.tsx'; 

const initialGroups = [
  {
    id: 1,
    name: 'Class 1',
    createdAt: new Date(),
    image: 'https://i.pinimg.com/736x/32/60/dc/3260dc3b3034bd82b1caef506ae0b8e0.jpg',
    instructor: 'Alice',
    students: ['John', 'Jane'],
    description: "",
  },
  {
    id: 2,
    name: 'Class 2',
    createdAt: new Date(),
    image: 'https://i.pinimg.com/736x/32/60/dc/3260dc3b3034bd82b1caef506ae0b8e0.jpg',
    instructor: 'Bob',
    students: ['Jim'],
    description: "",
  },
];

export default function AdminChat() {
  const [activeTab, setActiveTab] = useState<'classroom' | 'class-groups'>('classroom');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [classGroups, setClassGroups] = useState(initialGroups);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'classroom' | 'class-groups');
  };


  return (
    <div className="flex h-[96%]">
      <SidebarM
        classGroups={classGroups}
        setClassGroups={setClassGroups}
        onTabChange={handleTabChange}
        activeChatId={activeChatId}
        onSelectGroup={setActiveChatId}
      />
      <div className="flex-1 p-4">
        {activeTab === 'classroom' && activeChatId === null && (
          <p className="text-gray-500 dark:text-gray-300 text-center mt-10">
            Select a class group to view the chat.
          </p>
        )}

        {activeTab === 'classroom' && activeChatId !== null && (
          <ClassroomContent
          group={classGroups.find((group) => group.id === activeChatId) || {
            id: -1,
            name: 'Unknown',
            instructor: 'N/A',
            students: [],
            image: '/default-image.jpg',
            createdAt: new Date(),
            description: 'No description available',
          }}        
          />
        )}

        {activeTab === 'class-groups' && (
          <>
            <h2 className="text-xl font-semibold mb-4">Class Groups</h2>
            {/* <ClassGroupsContent classGroups={classGroups} onCreateGroup={handleCreateGroup} /> */}
          </>
        )}
      </div>
    </div>
  );
}
