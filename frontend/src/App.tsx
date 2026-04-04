import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DashboardAuthProvider } from "@/hooks/useDashboardUser";
// ── Layouts ──────────────────────────────────────────────────
import LandingLayout from "./landing/_components/landing_layout/Layout";
import { AdminLayout }      from "./dashboards/admin-dashboard/admin_layout/AdminLayout";
import { InstructorLayout } from "./dashboards/instructor-dashboard/instructor_layout/InstructorLayout";
import { StudentLayout }    from "./dashboards/student-dashboard/student_layout/StudentLayout";
// ── Student payment routes ─────────────────────────────────────────
import StudentCartSuccessFailure from "./dashboards/student-dashboard/pages/StudentCartSuccessFailure";
import StudentProcessing from "./dashboards/student-dashboard/pages/StudentProcessing";
import StudentCheckout from "./dashboards/student-dashboard/pages/StudentCheckout";
import StudentProvider from "./dashboards/student-dashboard/pages/StudentProvider";
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
// ── Instructor pages ──────────────────────────────────────────
import InstructorHome from "./dashboards/instructor-dashboard/pages/InstructorHome";
// ── Student pages ─────────────────────────────────────────────
import StudentHome from "./dashboards/student-dashboard/pages/StudentHome";
// ── Shared ────────────────────────────────────────────────────
import NotFound from "./landing/_components/NotFound";
import InstructorProfile from "./dashboards/instructor-dashboard/pages/InstructorProfile";
import InstructorSettings from "./dashboards/instructor-dashboard/pages/InstructorSettings";
import StudentProfile from "./dashboards/student-dashboard/pages/StudentProfile";
import AdminProfile from "./dashboards/admin-dashboard/pages/AdminProfile";
import StudentSettings from "./dashboards/student-dashboard/pages/StudentSettings";
import PreviewInstructor from "./dashboards/commons/PreviewInstructor";
import AdminStudentManagement from "./dashboards/admin-dashboard/pages/AdminStudentManagement";
import AdminInstructorManagement from "./dashboards/admin-dashboard/pages/AdminInstructorManagement";
import AdminAdminManagement from "./dashboards/admin-dashboard/pages/AdminAdminManagement";
import StudentSupport from "./dashboards/student-dashboard/pages/StudentSupport";
import InstructorSupport from "./dashboards/instructor-dashboard/pages/InstructorSupport";
import AdminSupport from "./dashboards/admin-dashboard/pages/AdminSupport";
import AdminSettings from "./dashboards/admin-dashboard/pages/AdminSettings";
import AdminAllNotifications from "./dashboards/admin-dashboard/pages/AdminAllNotifications";
import { InstructorAllNotifications } from "./dashboards/instructor-dashboard/pages/InstructorAllNotifications";
import StudentAllNotifications from "./dashboards/student-dashboard/pages/StudentAllNotifications";
import StudentCertificates from "./dashboards/student-dashboard/pages/StudentCertificates";
import StudentProgress from "./dashboards/student-dashboard/pages/StudentProgress";
import StudentWishlist from "./dashboards/student-dashboard/pages/StudentWishlist";
import StudentCart from "./dashboards/student-dashboard/pages/StudentCart";
import StudentStudentInfoForm from "./dashboards/student-dashboard/pages/StudentStudentInfoForm";
import StudentCourses from "./dashboards/student-dashboard/pages/StudentCourses";
import StudentExploreCourses from "./dashboards/student-dashboard/pages/StudentExploreCourses";
import StudentSingleCourse from "./dashboards/student-dashboard/pages/StudentSingleCourse";
import StudentSingleInstructor from "./dashboards/student-dashboard/pages/StudentSingleInstructor";
import StudentGrades from "./dashboards/student-dashboard/pages/StudentGrades";
import InstructorGrades from "./dashboards/instructor-dashboard/pages/InstructorGrades";
import AdminGrades from "./dashboards/admin-dashboard/pages/AdminGrades";
import InstructorAssignment from "./dashboards/instructor-dashboard/pages/InstructorAssignment";
import AdminAssignment from "./dashboards/admin-dashboard/pages/AdminAssignment";
import StudentAssignment from "./dashboards/student-dashboard/pages/StudentAssignment";
import SingleSubmittedAssignment from "./dashboards/commons/SingleSubmittedAssignment";
import AdminCreateAssignment from "./dashboards/admin-dashboard/pages/AdminCreateAssignment";
import AdminTransactions from "./dashboards/admin-dashboard/pages/AdminTransactions";
import AdminAnnouncements from "./dashboards/admin-dashboard/pages/AdminAnnouncements";
import StudentChat from "./dashboards/student-dashboard/pages/StudentChat";
import InstructorChat from "./dashboards/instructor-dashboard/pages/InstructorChat";
import AdminChat from "./dashboards/admin-dashboard/pages/AdminChat";
import AdminCreateCourse from "./dashboards/admin-dashboard/pages/AdminCreateCourse";
import AdminManageCourses from "./dashboards/admin-dashboard/pages/AdminManageCourses";
import AdminSingleCourse from "./dashboards/admin-dashboard/pages/AdminSingleCourse";
import { InstructorSingleCourse } from "./dashboards/instructor-dashboard/pages/InstructorSingleCourse";
import InstructorCourses from "./dashboards/instructor-dashboard/pages/InstructorCourses";
import PreviewAdmin from "./dashboards/commons/PreviewAdmin";
import PreviewStudent from "./dashboards/commons/PreviewStudent";
import AdminSearch from "./dashboards/admin-dashboard/pages/AdminSearch";
import InstructorSearch from "./dashboards/instructor-dashboard/pages/InstructorSearch";
import StudentSearch from "./dashboards/student-dashboard/pages/StudentSearch";
import StudentCategories from "./dashboards/student-dashboard/pages/StudentCategories";
import StudentSingleCategory from "./dashboards/student-dashboard/pages/StudentSingleCategory";
import About from "./landing/pages/About";
import ResetPassword from "./auth/student_auth/ResetPassword";
import InstructorResetPassword from "./auth/instructor_auth/InstructorResetPassword";
import AdminResetPassword from "./auth/admin_auth/AdminResetPassword";
 
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
      { path: "about",              element: <About /> },
      // Auth
      { path: "login",                          element: <Login /> },
      { path: "forgotten-password",             element: <Forgotten /> },
      { path: "reset-password",           element: <ResetPassword /> },
      { path: "instructor/login",               element: <InstructorLogin /> },
      { path: "instructor/forgotten-password",  element: <InstructorForgotten /> },
      { path: "instructor/reset-password",  element: <InstructorResetPassword /> },
      { path: "admin/login",                    element: <AdminLogin /> },
      { path: "admin/forgotten-password",       element: <AdminForgotten /> },
      { path: "admin/reset-password",           element: <AdminResetPassword /> }
    ],
  },
  // ── Admin dashboard ───────────────────────────────────────────
  {
  path: "/admin",
  element: (
    <DashboardAuthProvider defaultRole="admin">
      <AdminLayout />
    </DashboardAuthProvider>
  ),
  children: [
    { index: true, element: <AdminHome /> },
    { path: "admins", element: <AdminAdminManagement /> },
    { path: "instructors", element: <AdminInstructorManagement /> },
    { path: "students", element: <AdminStudentManagement /> },
    { path: "profile", element: <AdminProfile /> },
    { path: "instructors/:id", element: <PreviewInstructor /> },
    { path: "admins/:id", element: <PreviewAdmin /> },
    { path: "students/:id", element: <PreviewStudent /> },
    { path: "support", element: <AdminSupport /> },
    { path: "settings", element: <AdminSettings /> },
    { path: "notifications", element: <AdminAllNotifications /> },
    { path: "grades", element: <AdminGrades /> },
    { path: "assignments", element: <AdminAssignment /> },  
    { path: "assignments/:id/submissions", element: <SingleSubmittedAssignment /> },
    { path: "assignments/create", element: <AdminCreateAssignment /> },
    { path: "transactions", element: <AdminTransactions /> },
    { path: "announcements", element: <AdminAnnouncements /> },
    { path: "discussions", element: <AdminChat /> },
    { path: "courses/create", element: <AdminCreateCourse /> },
    { path: "courses/:id", element: <AdminSingleCourse /> },
    { path: "courses/:id/edit", element: <AdminCreateCourse /> },
    { path: "courses", element: <AdminManageCourses /> },
    { path: "search", element: <AdminSearch /> },
  ],
},
  // ── Instructor dashboard ──────────────────────────────────────
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
    { path: "instructor-profile", element: <PreviewInstructor /> },
    { path: "support", element: <InstructorSupport /> },
    { path: "notifications", element: <InstructorAllNotifications /> },
    { path: "assignments", element: <InstructorAssignment /> },
    { path: "assignments/:id/submissions", element: <SingleSubmittedAssignment /> },
    { path: "grades", element: <InstructorGrades /> },
    { path: "discussions", element: <InstructorChat /> },
    { path: "courses", element: <InstructorCourses /> },
    { path: "courses/:id", element: <InstructorSingleCourse /> },
    { path: "search", element: <InstructorSearch /> },
  ],
},
  // ── Student dashboard ─────────────────────────────────────────
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
    { path: "instructor-profile", element: <PreviewInstructor /> },
    { path: "support", element: <StudentSupport /> },
    { path: "notifications", element: <StudentAllNotifications /> },
    { path: "certificates", element: <StudentCertificates /> },
    { path: "progress",     element: <StudentProgress /> },
    { path: "wishlist",     element: <StudentWishlist /> },
    { path: "courses",      element: <StudentCourses /> },
    { path: "courses/:id",   element: <StudentSingleCourse /> },
    { path: "explore",      element: <StudentExploreCourses /> },
    { path: "instructors/:id", element: <StudentSingleInstructor /> },
    // cart/payment routes
    { path: "cart",         element: <StudentCart /> },
    { path: "cart/processing",   element: <StudentProcessing /> },
    { path: "cart/payment",      element: <StudentProvider /> },
    { path: "cart/order-complete", element: <StudentCartSuccessFailure /> },
    { path: "cart/checkout",     element: <StudentCheckout /> },
    { path: "cart/student-info", element: <StudentStudentInfoForm /> },
    // Assignments and grades routes
    { path: "assignments", element: <StudentAssignment /> },
    { path: "grades", element: <StudentGrades /> },
    { path: "messages", element: <StudentChat /> },
    { path: "search", element: <StudentSearch /> }, 
    { path: "categories", element: <StudentCategories /> },
    { path: "categories/:id", element: <StudentSingleCategory /> },
  ],
},
  // ── 404 ───────────────────────────────────────────────────────
  { path: "*", element: <NotFound /> },
]);
const App = () => <RouterProvider router={router} />;
export default App;