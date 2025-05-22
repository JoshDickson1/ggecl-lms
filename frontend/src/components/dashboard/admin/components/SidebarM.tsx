import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sidebar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ClassComp from "./ClassComp";
import GroupComp from "./GroupComp";

interface SidebarMProps {
  onTabChange: (value: string) => void;
  activeChatId: number | null;
  onSelectGroup: (id: number) => void;
  setClassGroups: React.Dispatch<React.SetStateAction<any[]>>;
  classGroups: {
    id: number;
    name: string;
    createdAt: Date;
    image: string;
    instructor: string;
    students: string[];
    description: string;
    classroomId?: number;
  }[];
}

const SidebarM: React.FC<SidebarMProps> = ({
  onTabChange,
  activeChatId,
  onSelectGroup,
  classGroups,
  setClassGroups,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("classroom");

  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab") || "classroom";
    setActiveTab(savedTab);
    onTabChange(savedTab);
  }, [onTabChange]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem("activeTab", value);
    onTabChange(value);
  };

  return (
    <div
      className={cn(
        "flex w-0 flex-col border-r bg-gray-50 from-gray-900 to-gray-800 px-2 py-6 md:w-72 dark:border-gray-700 dark:bg-gradient-to-br",
        "transition-transform duration-300 ease-in-out",
        isMobile
          ? isMobileMenuOpen
            ? "w-72 translate-x-0 whitespace-nowrap"
            : "-ml-2 w-0 -translate-x-full"
          : "translate-x-0",
      )}
    >
      {isMobile && (
        <div className="absolute top-0 right-0 z-10">
          <button
            onClick={toggleMobileMenu}
            className="-mr-32 ml-2 rounded-b-lg bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Sidebar className="ml-0 h-5 w-5" />
            )}
          </button>
        </div>
      )}

      <div className="sticky top-20 min-h-32 overflow-x-hidden pt-4">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="mb-4"
        >
          <TabsList className="flex w-full flex-row items-center space-y-4 px-2">
            <TabsTrigger
              value="classroom"
              className="relative w-full text-lg font-medium dark:text-gray-200"
            >
              Classroom
              <span className="absolute top-0 right-2 rounded-full bg-red-500 px-1 text-xs text-white">
                {classGroups.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="class-groups"
              className="relative mb-[1.2rem] w-full text-lg font-medium text-gray-600 dark:text-gray-200"
            >
              Class Groups
              <span className="absolute top-0 right-2 rounded-full bg-blue-500 px-1 text-xs text-white"></span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classroom">
            <ClassComp
              classGroups={classGroups}
              onSelectGroup={onSelectGroup}
              activeChatId={activeChatId}
              setClassGroups={setClassGroups}
            />
          </TabsContent>

          <TabsContent value="class-groups">
            <GroupComp
              classGroups={classGroups.map((group) => ({
                ...group,
                classroomId: group.classroomId?.toString() || "", // ✅ Convert to string
              }))}
              setClassGroups={setClassGroups}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SidebarM;
