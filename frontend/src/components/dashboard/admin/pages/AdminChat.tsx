import { useState } from "react";
import SidebarM from "../components/SidebarM";
import ClassroomContent from "../components/ClassroomContent";
// import GroupComp from "../components/GroupComp";
import ClassGroupContent from "../components/ClassGroupContent";
// import ClassGroupsContent from '../components/ClassGroupsContent';
// import GroupComp from '../components/GroupComp';
// import { ClassGroupsContent } from '../components/ClassGroupsContent.tsx';

const initialGroups = [
  {
    id: 1,
    name: "Frontend Masters",
    createdAt: new Date("2023-09-01"),
    image:
      "https://media.istockphoto.com/id/1956818527/photo/crowd-of-business-people-having-a-seminar-in-board-room.jpg?s=612x612&w=0&k=20&c=bazpLXOSPCPSy_3Gtvq4Sq-SygVi11KqhHmLgCdSAAg=",
    instructor: "Jane Doe",
    students: ["Alice", "Bob", "Charlie"],
    description: "A deep dive into React, Vue, and modern frontend tooling.",
    subGroups: [
      {
        id: 101,
        name: "React Basics",
        createdAt: new Date("2023-09-10"),
        image: "https://www.patterns.dev/img/reactjs/react-logo@3x.svg",
        instructor: "John Smith",
        students: ["Alice", "Charlie"],
        description: "Covers JSX, components, and hooks.",
      },
      {
        id: 102,
        name: "Vue Advanced",
        createdAt: new Date("2023-09-12"),
        image:
          "https://miro.medium.com/v2/resize:fit:2000/1*oZqGznbYXJfBlvGp5gQlYQ.jpeg",
        instructor: "Laura Wells",
        students: ["Bob"],
        description: "Focuses on Vue 3 composition API and Vuex.",
      },
    ],
  },
  {
    id: 2,
    name: "Backend Bootcamp",
    createdAt: new Date("2023-08-15"),
    image:
      "https://offensoacademy.com/wp-content/uploads/2023/10/ethical-hackerpg-1024x694.webp",
    instructor: "Michael Jordan",
    students: ["Daniel", "Emma", "Frank"],
    description: "Learn Node.js, Express, and databases with real projects.",
    subGroups: [
      {
        id: 201,
        name: "Node & Express",
        createdAt: new Date("2023-08-20"),
        image:
          "https://images.ctfassets.net/aq13lwl6616q/7cS8gBoWulxkWNWEm0FspJ/c7eb42dd82e27279307f8b9fc9b136fa/nodejs_cover_photo_smaller_size.png",
        instructor: "Sarah Connor",
        students: ["Daniel", "Frank"],
        description: "API development with Express and routing concepts.",
      },
      {
        id: 202,
        name: "Database Integration",
        createdAt: new Date("2023-08-22"),
        image:
          "https://bs-uploads.toptal.io/blackfish-uploads/components/blog_post_page/4084683/cover_image/regular_1708x683/0712-Bad_Practices_in_Database_Design_-_Are_You_Making_These_Mistakes_Dan_Newsletter-549c07a55cc276f4204263b6e6bef737.png",
        instructor: "James Bond",
        students: ["Emma"],
        description: "Covers MongoDB and SQL database handling.",
      },
    ],
  },
];

// const initialRooms = [
//   {
//     id: 1,
//     name: "Class 1",
//     createdAt: new Date(),
//     image:
//       "https://i.pinimg.com/736x/32/60/dc/3260dc3b3034bd82b1caef506ae0b8e0.jpg",
//     instructor: "Alice",
//     students: ["John", "Jane"],
//     description: "",
//   },
//   {
//     id: 2,
//     name: "Class 2",
//     createdAt: new Date(),
//     image:
//       "https://i.pinimg.com/736x/32/60/dc/3260dc3b3034bd82b1caef506ae0b8e0.jpg",
//     instructor: "Bob",
//     students: ["Jim"],
//     description: "",
//   },
// ];

export default function AdminChat() {
  const [activeTab, setActiveTab] = useState<"classroom" | "class-groups">(
    "classroom",
  );
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [classGroups, setClassGroups] = useState(initialGroups);
  const [activeSubGroup, setActiveSubGroup] = useState<string | null>(null);

  // const [classRooms, setClassRooms] = useState(initialRooms);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "classroom" | "class-groups");
  };

  // Add handleCreateGroup function
  // const handleCreateGroup = (newGroup: any) => {
  //   setClassGroups((prevGroups) => [...prevGroups, newGroup]);
  // };

  return (
    <div className="flex h-[96%]">
      <SidebarM
        classGroups={classGroups}
        setClassGroups={setClassGroups}
        onTabChange={handleTabChange}
        activeChatId={activeChatId}
        setActiveSubGroup={setActiveSubGroup}
        onSelectGroup={setActiveChatId}
      />
      <div className="flex-1 p-4">
        {activeTab === "classroom" && activeChatId === null && (
          <p className="mt-10 text-center text-gray-500 dark:text-gray-300">
            Select a class group to view the chat.
          </p>
        )}

        {activeTab === "classroom" && activeChatId !== null && (
          <ClassroomContent
            group={
              classGroups.find((group) => group.id === activeChatId) || {
                id: -1,
                name: "Unknown",
                instructor: "N/A",
                students: [],
                image: "/default-image.jpg",
                createdAt: new Date(),
                description: "No description available",
              }
            }
          />
        )}

        {activeTab === "class-groups" && activeChatId !== null && (
          <ClassGroupContent
            group={
              classGroups
                .flatMap((group) => group.subGroups)
                .find(
                  (group) => group.id.toLocaleString() === activeSubGroup,
                ) || {
                id: -1,
                name: "Unknown",
                instructor: "N/A",
                students: [],
                image: "/default-image.jpg",
                createdAt: new Date(),
                description: "No description available",
              }
            }
          />
        )}
      </div>
    </div>
  );
}
