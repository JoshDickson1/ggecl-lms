import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DashboardAuthProvider } from "@/hooks/useDashboardUser";
// ── Layouts ──────────────────────────────────────────────────
import LandingLayout from "./landing/_components/landing_layout/Layout";
import { AdminLayout }      from "./dashboards/admin-dashboard/admin_layout/AdminLayout";
import { InstructorLayout } from "./dashboards/instructor-dashboard/instructor_layout/InstructorLayout";
import { StudentLayout }    from "./dashboards/student-dashboard/student_layout/StudentLayout";
 
// ── Landing pages ─────────────────────────────────────────────
import Home              from "./landing/pages/Home";
import Search            from "./landing/pages/Search";
import AllCategories     from "./landing/pages/AllCategories";
import SingleCategory    from "./landing/pages/SingleCategory";
import AllCourses        from "./landing/pages/AllCourses";
import SingleCourse      from "./landing/pages/SingleCourse";
import AllInstructors    from "./landing/pages/AllInstructors";
import SingleInstructor  from "./landing/pages/SingleInstructor";
import Cart              from "./landing/pages/Cart";
import Processing        from "./landing/pages/Processing";
import Checkout          from "./landing/pages/Checkout";
import Provider          from "./landing/pages/Provider";
import StudentInfoForm   from "./landing/pages/StudentInfoForm";
import CartSuccessFailure from "./landing/pages/CartSuccessFailure";
 
// ── Auth pages ────────────────────────────────────────────────
import Login               from "./auth/student_auth/Login";
import Forgotten           from "./auth/student_auth/Forgotten";
import AdminLogin          from "./auth/admin_auth/AdminLogin";
import AdminForgotten      from "./auth/admin_auth/AdminForgotten";
import InstructorLogin     from "./auth/instructor_auth/InstructorLogin";
import InstructorForgotten from "./auth/instructor_auth/InstructorForgotten";
 
// ── Admin pages ───────────────────────────────────────────────
import AdminHome        from "./dashboards/admin-dashboard/pages/AdminHome";
// import AdminUsers    from "./dashboards/admin-dashboard/pages/AdminUsers";
// import AdminCourses  from "./dashboards/admin-dashboard/pages/AdminCourses";
// ... other admin pages
 
// ── Instructor pages ──────────────────────────────────────────
import InstructorHome from "./dashboards/instructor-dashboard/pages/InstructorHome";
// import InstructorCourses from ...
// import InstructorEarnings from ...
 
// ── Student pages ─────────────────────────────────────────────
import StudentHome from "./dashboards/student-dashboard/pages/StudentHome";
// import StudentCourses from ...
// import StudentCertificates from ...
 
// ── Shared ────────────────────────────────────────────────────
import NotFound from "./landing/_components/NotFound";
import InstructorProfile from "./dashboards/instructor-dashboard/pages/InstructorProfile";
import InstructorSettings from "./dashboards/instructor-dashboard/pages/InstructorSettings";
import StudentProfile from "./dashboards/student-dashboard/pages/StudentProfile";
import AdminProfile from "./dashboards/admin-dashboard/pages/AdminProfile";
import StudentSettings from "./dashboards/student-dashboard/pages/StudentSettings";
 
const router = createBrowserRouter([
 
  // ── Landing ──────────────────────────────────────────────────
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      { index: true,                  element: <Home /> },
      { path: "search",               element: <Search /> },
      { path: "categories",           element: <AllCategories /> },
      { path: "categories/:id",       element: <SingleCategory /> },
      { path: "courses",              element: <AllCourses /> },
      { path: "courses/:id",          element: <SingleCourse /> },
      { path: "instructors",          element: <AllInstructors /> },
      { path: "instructors/:id",      element: <SingleInstructor /> },
      { path: "cart",                 element: <Cart /> },
      { path: "processing",           element: <Processing /> },
      { path: "payment",              element: <Provider /> },
      { path: "order-complete",       element: <CartSuccessFailure /> },
      { path: "checkout",             element: <Checkout /> },
      { path: "student-info",         element: <StudentInfoForm /> },
      // Auth
      { path: "login",                          element: <Login /> },
      { path: "forgotten-password",             element: <Forgotten /> },
      { path: "instructor/login",               element: <InstructorLogin /> },
      { path: "instructor/forgotten-password",  element: <InstructorForgotten /> },
      { path: "admin/login",                    element: <AdminLogin /> },
      { path: "admin/forgotten-password",       element: <AdminForgotten /> },
    ],
  },
 
  // ── Admin dashboard ───────────────────────────────────────────
  // Only admin role can access these routes (guard is inside AdminLayout)
  {
  path: "/admin",
  element: (
    <DashboardAuthProvider defaultRole="admin">
      <AdminLayout />
    </DashboardAuthProvider>
  ),
  children: [
    { index: true, element: <AdminHome /> },
    { path: "profile", element: <AdminProfile /> },
  ],
},
 
  // ── Instructor dashboard ──────────────────────────────────────
  // Only instructor role can access these routes
  {
  path: "/instructor",
  element: (
    <DashboardAuthProvider defaultRole="instructor">
      <InstructorLayout />
    </DashboardAuthProvider>
  ),
  children: [
    { index: true, element: <InstructorHome /> },
    { path: "profile", element: <InstructorProfile /> },
    { path: "Settings", element: <InstructorSettings /> },
  ],
},
 
  // ── Student dashboard ─────────────────────────────────────────
  // Only student role can access these routes
  {
  path: "/student",
  element: (
    <DashboardAuthProvider defaultRole="student">
      <StudentLayout />
    </DashboardAuthProvider>
  ),
  children: [
    { index: true, element: <StudentHome /> },
    { path: "profile", element: <StudentProfile /> },
    { path: "settings", element: <StudentSettings /> },
  ],
},
 
  // ── 404 ───────────────────────────────────────────────────────
  { path: "*", element: <NotFound /> },
]);
 
const App = () => <RouterProvider router={router} />;
export default App;