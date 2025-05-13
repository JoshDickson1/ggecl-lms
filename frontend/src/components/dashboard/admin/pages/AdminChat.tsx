// app/page.tsx
import { useState } from 'react';
import SidebarM from '../components/SidebarM';
import ClassroomContent from '../components/ClassroomContent';
import ClassGroupsContent from '../components/ClassGroupsContent';

export default function AdminChat() {
  const [activeTab, setActiveTab] = useState<'classroom' | 'class-groups'>('classroom');

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'classroom' | 'class-groups');
  };

  return (
    <div className="flex h-full">
      <SidebarM
        onTabChange={handleTabChange}
      />
      <div className="flex-1 p-4">
        {activeTab === 'classroom' && (
          <>
            {/* <h2 className="text-xl font-semibold mb-4">Classroom</h2> */}
            <ClassroomContent />
          </>
        )}
        {activeTab === 'class-groups' && (
          <>
            <h2 className="text-xl font-semibold mb-4">Class Groups</h2>
            <ClassGroupsContent />
          </>
        )}
      </div>
    </div>
  );
}
