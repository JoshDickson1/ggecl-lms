import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sidebar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ClassComp from "./ClassComp";
import GroupComp from "./GroupComp";
import { ClassGroup } from "@/types/classGroupTypes";

// interface classGroup {
//   id: number;
//   name: string;
//   createdAt: Date;
//   image: string;
//   instructor: string;
//   students: string[];
//   description: string;
//   subGroups: {
//     id: number;
//     name: string;
//     createdAt: Date;
//     image: string;
//     instructor: string;
//     students: string[];
//     description: string;
//   }[];
// }
// [];

interface SidebarMProps {
  onTabChange: (value: string) => void;
  activeChatId: number | null;
  onSelectGroup: (id: number) => void;
  setClassGroups: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveSubGroup: React.Dispatch<React.SetStateAction<string | null>>;
  classGroups: ClassGroup[];
}

const SidebarM: React.FC<SidebarMProps> = ({
  onTabChange,
  activeChatId,
  onSelectGroup,
  classGroups,
  setClassGroups,
  setActiveSubGroup,
}) => {
  // console.log("classGroups", classGroups);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("classroom");
  const [showSubs, setShowSubs] = useState<string | null>(null);

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
            {classGroups.map((group) => (
              <div key={group.id} className="mb-3 pb-2">
                <div
                  className="relative mb-2 cursor-pointer rounded-lg bg-white p-3 shadow-sm transition hover:shadow-md dark:bg-gray-800"
                  onClick={() => {
                    setShowSubs((prev) =>
                      prev === group.id.toString() ? null : group.id.toString(),
                    );
                  }}
                >
                  <GroupComp
                    classGroups={[group]}
                    setClassGroups={setClassGroups}
                  />
                </div>

                {showSubs === group.id.toString() &&
                  (group.subGroups?.length ?? 0) > 0 && (
                    <div className="pl-4">
                      {group.subGroups
                        ?.filter(
                          (subGroup) =>
                            subGroup !== undefined && subGroup !== null,
                        )
                        .map((subGroup) => (
                          <div
                            key={subGroup.id}
                            className="mt-1.5 cursor-pointer border-l-8 border-gray-500"
                            onClick={() =>
                              setActiveSubGroup(subGroup.id.toString())
                            }
                          >
                            <GroupComp
                              classGroups={[subGroup]}
                              setClassGroups={setClassGroups}
                            />
                          </div>
                        ))}
                    </div>
                  )}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SidebarM;
