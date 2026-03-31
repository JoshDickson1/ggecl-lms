import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// layouts
import LandingLayout from "./landing/_components/landing_layout/Layout";
// import DashboardLayout from "./dashboard/layout/DashboardLayout";

// landing pages
import Home from "./landing/pages/Home";
// import Courses from "./landing/pages/Courses";

// dashboard pages
// import DashboardHome from "./dashboard/pages/DashboardHome";
// import Students from "./dashboard/pages/Students";
// import Settings from "./dashboard/pages/Settings";

// shared
import NotFound from "./landing/_components/NotFound";
import Search from "./landing/pages/Search";
import Login from "./auth/student_auth/Login";
import Forgotten from "./auth/student_auth/Forgotten";
import AdminForgotten from "./auth/admin_auth/AdminForgotten";
import AdminLogin from "./auth/admin_auth/AdminLogin";
import InstructorForgotten from "./auth/instructor_auth/InstructorForgotten";
import InstructorLogin from "./auth/instructor_auth/InstructorLogin";

const router = createBrowserRouter([
  // 🌍 Landing routes
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "search", element: <Search /> },
      // { path: "courses", element: <Courses /> },

      // Auth routes for students:
      { path: "login", element: <Login /> },
      { path: "forgotten-password", element: <Forgotten /> },

      // Auth routes for instructors:
      { path: "instructor/login", element: <InstructorLogin /> },
      { path: "instructor/forgotten-password", element: <InstructorForgotten /> },

      // Auth routes for admins:
      { path: "admin/login", element: <AdminLogin /> },
      { path: "admin/forgotten-password", element: <AdminForgotten /> },
    ],
  },

  // 📊 Dashboard routes
  // {
  //   path: "/dashboard",
  //   element: <DashboardLayout />,
  //   children: [
  //     { index: true, element: <DashboardHome /> },
  //     { path: "students", element: <Students /> },
  //     { path: "settings", element: <Settings /> },
  //   ],
  // },

  // ❌ 404
  {
    path: "*",
    element: <NotFound />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;