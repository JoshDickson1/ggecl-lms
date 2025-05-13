import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function CoursesSidebar() {

  return (
    <Sidebar>
      <SidebarHeader>Filter</SidebarHeader>
      <SidebarContent>
        <SidebarGroup></SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
