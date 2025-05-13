interface NavLink {
  title: string;
  path: string;
}

export const links: NavLink[] = [
  { title: "Home", path: "/" },
  { title: "Courses", path: "/courses" },
  { title: "Live Sessions", path: "/live-sessions" },
  { title: "Community", path: "/community" },
  { title: "Contact", path: "/contact" },
];
