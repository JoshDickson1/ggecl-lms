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
import AllCategories from "./landing/pages/AllCategories";
import SingleCategory from "./landing/pages/SingleCategory";
import AllCourses from "./landing/pages/AllCourses";
import SingleCourse from "./landing/pages/SingleCourse";
import SingleInstructor from "./landing/pages/SingleInstructor";
import AllInstructors from "./landing/pages/AllInstructors";
import CartSuccessFailure from "./landing/pages/CartSuccessFailure";
import Cart from "./landing/pages/Cart";
import Processing from "./landing/pages/Processing";
import Checkout from "./landing/pages/Checkout";
import Provider from "./landing/pages/Provider";
import StudentInfoForm from "./landing/pages/StudentInfoForm";
const router = createBrowserRouter([
  // 🌍 Landing routes
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "search", element: <Search /> },
      { path: "categories", element: <AllCategories /> },
      { path: "categories/:id", element: <SingleCategory /> },
      { path: "courses", element: <AllCourses /> },
      { path: "courses/:id", element: <SingleCourse /> },
      { path: "instructors", element: <AllInstructors /> },
      { path: "instructors/:id", element: <SingleInstructor /> },
      { path: "cart", element: <Cart /> },
      { path: "processing", element: <Processing /> },
      { path: "payment", element: <Provider /> },
      { path: "order-complete", element: <CartSuccessFailure /> },
      { path: "checkout", element: <Checkout /> },
      { path: "student-info", element: <StudentInfoForm /> }, 

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