import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sidebar, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import GroupComp from "./GroupComp";
import ClassComp from "./ClassComp";

interface SidebarMProps {
  onTabChange: (value: string) => void;
}

// Dummy components
const ClassroomComp = () => <ClassComp />;
const ClassGroupComp = () => <GroupComp />;

const SidebarM: React.FC<SidebarMProps> = ({ onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('classroom');

  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab') || 'classroom';
    setActiveTab(savedTab);
    onTabChange(savedTab);
  }, []);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('activeTab', value);
    onTabChange(value);
  };

  return (
    <div
      className={cn(
        "md:w-72 w-0 border-r bg-gray-50 dark:bg-gradient-to-br from-gray-900 to-gray-800 dark:border-gray-700 px-2 py-6 flex flex-col ",
        "transition-transform duration-300 ease-in-out",
        isMobile ? (isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full w-0 -ml-2") : "translate-x-0"
      )}
    >
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <div className="absolute top-0 right-0 z-10">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-500 dark:text-gray-300 -mr-32 bg-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-b-lg  ml-2"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Sidebar className="h-5 w-5 ml-0" />}
          </button>
        </div>
      )}

      <div className="sticky top-20 overflow-x-hidden min-h-32 pt-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
          <TabsList className="flex flex-row w-full items-center px-2 space-y-4">
            <TabsTrigger
              value="classroom"
              className="relative w-full font-medium text-lg dark:text-gray-200"
            >
              Classroom
              <span className="absolute top-0 right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                3
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="class-groups"
              className="relative w-full mb-[1.2rem] font-medium text-lg text-gray-600 dark:text-gray-200"
            >
              Class Groups
              <span className="absolute top-0 right-2 bg-blue-500 text-white text-xs px-1 rounded-full">
                7
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classroom">
            <ClassroomComp />
          </TabsContent>
          <TabsContent value="class-groups">
            <ClassGroupComp />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SidebarM;
