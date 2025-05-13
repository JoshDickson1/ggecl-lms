import { useMemo, JSX } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  LucideGraduationCap,
  LucideUsers,
  LucideBarChart3,
  LucideUserPlus,
  LucideUserRoundPlus,
  LucideShieldPlus,
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useStudents } from "@/hooks/useStudents";
import { useInstructors } from "@/hooks/useInstructors";
import { useCourses } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";

// ---------------- Types ----------------
interface StatCardProps {
  title: string;
  value: number;
  icon: JSX.Element;
}

interface CtaBannerProps {
  title: string;
  description: string;
  link: string;
  icon: JSX.Element;
  colorClass: string;
}

// ---------------- Constants ----------------
const ctaBanners: CtaBannerProps[] = [
  {
    title: "Enroll Students",
    description: "Easily onboard new learners to your platform.",
    link: "/admin/dashboard/students",
    icon: <LucideUserPlus className="h-6 w-6 text-blue-400" />,
    colorClass:
      "border-blue-300 text-blue-700 dark:border-blue-900 dark:text-blue-300",
  },
  {
    title: "Add Instructors",
    description: "Grow your teaching team with skilled professionals.",
    link: "/admin/dashboard/instructors",
    icon: <LucideUserRoundPlus className="h-6 w-6 text-purple-400" />,
    colorClass:
      "border-purple-300 text-purple-700 dark:border-purple-900 dark:text-purple-300",
  },
  {
    title: "Add Administrator",
    description: "Grant access to manage the platform effectively.",
    link: "/admin/dashboard/admins",
    icon: <LucideShieldPlus className="h-6 w-6 text-red-500" />,
    colorClass:
      "border-red-300 text-red-700 dark:border-red-900 dark:text-red-300",
  },
];

const Dashboard: React.FC = () => {
  const { admin } = useAdmin();
  const { meta: studentMeta } = useStudents({});
  const { meta: instructorMeta } = useInstructors({});
  const { meta: courseMeta } = useCourses({});

  const stats: StatCardProps[] = useMemo(
    () => [
      {
        title: "Enrolled Students",
        value: studentMeta?.total ?? 0,
        icon: <LucideGraduationCap className="h-8 w-8 text-blue-500" />,
      },
      {
        title: "Course Instructors",
        value: instructorMeta?.total ?? 0,
        icon: <LucideUsers className="h-8 w-8 text-purple-500" />,
      },
      {
        title: "Active Courses",
        value: courseMeta?.total ?? 0,
        icon: <LucideBarChart3 className="h-8 w-8 text-yellow-500" />,
      },
    ],
    [studentMeta, instructorMeta, courseMeta],
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 transition-all dark:bg-gray-900">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Hello, {admin.fullName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your platform's key statistics and quick actions.
        </p>
      </header>

      {/* Stats Cards */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {stats.map((stat) => (
          <motion.div
            key={stat.title}
            className="flex items-center space-x-4 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {stat.icon}
            <div>
              <p className="text-sm text-gray-500 uppercase dark:text-gray-400">
                {stat.title}
              </p>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stat.value}
              </h2>
            </div>
          </motion.div>
        ))}
      </section>

      {/* CTA Banners */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ctaBanners.map((banner) => (
          <motion.div
            key={banner.title}
            className={`rounded-lg p-6 shadow-md ${banner.colorClass} dark:border dark:border-gray-700`}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.1 }}
          >
            <div className="mb-4 flex items-center">
              {banner.icon}
              <h3 className="ml-2 text-lg font-semibold dark:text-gray-100">
                {banner.title}
              </h3>
            </div>
            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              {banner.description}
            </p>
            <Link to={banner.link}>
              <Button variant={"secondary"}>{banner.title}</Button>
            </Link>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
