'use client';

import { useState } from 'react';
import ClassComp from './ClassComp';
import ClassroomContent from './ClassroomContent';

const initialGroups = [
  {
    id: 1,
    name: 'Class 1',
    createdAt: new Date(),
    image: 'https://i.pinimg.com/736x/32/60/dc/3260dc3b3034bd82b1caef506ae0b8e0.jpg',
    instructor: 'Alice',
    students: ['John', 'Jane'],
  },
  {
    id: 2,
    name: 'Class 2',
    createdAt: new Date(),
    image: 'https://i.pinimg.com/736x/32/60/dc/3260dc3b3034bd82b1caef506ae0b8e0.jpg',
    instructor: 'Bob',
    students: ['Jim'],
  },
];

export default function ClassroomWrapper() {
  const [classGroups, setClassGroups] = useState(initialGroups);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  const activeGroup = classGroups.find((g) => g.id === activeChatId) || null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="col-span-1 border-r pr-4">
        <ClassComp
          classGroups={classGroups}  // Pass the classGroups prop for rendering classes
          setClassGroups={setClassGroups}  // Pass the setter function for updating classGroups
          activeChatId={activeChatId}  // Pass the activeChatId to highlight the selected group
          onSelectGroup={setActiveChatId}  // Pass the function to handle selecting a group
        />
      </div>
      <div className="col-span-2">
        {activeGroup ? (
          <ClassroomContent group={activeGroup} />  // Render ClassroomContent for the selected group
        ) : (
          <p className="text-gray-500 dark:text-gray-300 text-center mt-10"> chat.</p>
        )}
      </div>
    </div>
  );
}
