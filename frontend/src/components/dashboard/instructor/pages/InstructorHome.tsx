import { FaPlayCircle, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  LucideUserPlus,
  LucideUserRoundPlus,
  LucideShieldPlus,
} from "lucide-react";
import { JSX, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useInstructor } from "@/hooks/useInstructor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateInitials } from "@/lib/generateInitial";
import { useIAssignments } from "../hooks/useIAssignments";
<<<<<<< HEAD
=======
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991

interface CtaBannerProps {
  title: string;
  description: string;
  link: string;
  icon: JSX.Element;
  colorClass: string;
}

const ctaBanners: CtaBannerProps[] = [
  {
    title: "Schedula an Assignment",
    description: "Easily onboard new learners to your platform.",
    link: "/instructor/dashboard/check-assignments",
    icon: <LucideUserPlus className="h-6 w-6 text-blue-400" />,
    colorClass:
      "border border-blue-300 dark:border-blue-900 text-blue-700 dark:text-blue-300",
  },
  {
    title: "View My Courses",
    description: "Grow your teaching team with skilled professionals.",
    link: "/instructor/dashboard/courses",
    icon: <LucideUserRoundPlus className="h-6 w-6 text-blue-500" />,
    colorClass:
      "border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300",
  },
  {
    title: "View list of Students",
    description: "Grant access to manage the platform effectively.",
    link: "/instructor/dashboard/students",
    icon: <LucideShieldPlus className="h-6 w-6 text-red-500" />,
    colorClass:
      "border border-red-100 dark:border-red-900 text-red-700 dark:text-red-300",
  },
];

const InstructorHome = () => {
  const { instructor } = useInstructor();
  const { meta } = useIAssignments({});

  const features = useMemo(
    () => [
      {
        id: 1,
<<<<<<< HEAD
        amount: instructor.courses.length,
=======
        amount: instructor?.courses?.length || 0,
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991
        info: "Assigned Courses",
        icon: (
          <FaPlayCircle
            className="rounded-sm bg-blue-200 p-2 text-blue-600"
            size={40}
          />
        ),
        border: "border-blue-300 dark:border-blue-600",
      },
<<<<<<< HEAD

      {
        id: 4,
        amount: instructor.students.length,
=======
      {
        id: 2,
        amount: instructor?.students?.length || 0,
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991
        info: "Total Students",
        icon: (
          <FaUserCircle
            className="rounded-sm bg-orange-200 p-2 text-orange-600"
            size={40}
          />
        ),
        border: "border-orange-300 dark:border-orange-600",
      },
      {
<<<<<<< HEAD
        id: 5,
=======
        id: 3,
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991
        amount: meta?.total ?? 0,
        info: "Total Assignments Given",
        icon: (
          <FaUserCircle
            className="rounded-sm bg-purple-200 p-2 text-purple-600"
            size={40}
          />
        ),
        border: "border-purple-300 dark:border-purple-600",
      },
    ],
<<<<<<< HEAD
    [],
=======
    [instructor, meta]
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991
  );

  return (
    <div className="bg-gray-50 p-6 transition-all dark:bg-gray-900">
<<<<<<< HEAD
      {/* Stats Section */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Hello, {instructor.fullName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          At‑a‑glance view of your courses, student engagement, and teaching
          tools.
        </p>
      </header>

      <div>
        {/* First Row */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {features.slice(0, 3).map((feature) => (
            <div
              key={feature.id}
              className={`flex flex-row items-center gap-4 border shadow-md ${feature.border} rounded-md p-3`}
            >
              {feature.icon}
              <div className="whitespace-normal text-gray-700 dark:text-gray-300">
                <p className="text-xl">{feature.amount}</p>
                <p className="text-sm">{feature.info}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Second Row */}
        <div className="mt-4 grid grid-cols-1 gap-4 whitespace-normal sm:grid-cols-2 md:grid-cols-5">
          {features.slice(3, 6).map((feature) => (
            <div
              key={feature.id}
              className={`flex flex-row items-center gap-4 border shadow-md ${feature.border} rounded-md p-3 whitespace-normal`}
            >
              {feature.icon}
              <div className="whitespace-normal text-gray-700 dark:text-gray-300">
                <p className="text-xl">{feature.amount}</p>
                <p className="text-sm">{feature.info}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Section */}
      <div className="mx-auto my-10 flex min-h-32 w-full flex-col items-center justify-start gap-6 rounded-md bg-gray-800 px-6 py-4 md:flex-row md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 object-cover">
            <AvatarImage src={instructor.picture} />
            <AvatarFallback>
              {generateInitials(instructor.fullName)}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="font-semibold text-white">{instructor.fullName}</p>
            <p className="text-sm text-gray-400">{instructor.email}</p>
          </div>
        </div>

        <Link to="/instructor/dashboard/settings">
          <Button variant={"secondary"}>Edit Bio</Button>
        </Link>
      </div>
=======
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Hello, {instructor?.fullName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          At‑a‑glance view of your courses, student engagement, and teaching tools.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.id}
            className={`flex flex-row items-center gap-4 p-4 ${feature.border}`}
          >
            {feature.icon}
            <div>
              <p className="text-xl font-semibold">{feature.amount}</p>
              <p className="text-sm text-muted-foreground">{feature.info}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Profile Section */}
      <Card className="my-10 flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-800">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 object-cover">
            <AvatarImage src={instructor?.picture} />
            <AvatarFallback>
              {generateInitials(instructor?.fullName || "")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-white">{instructor?.fullName}</p>
            <p className="text-sm text-gray-400">{instructor?.email}</p>
          </div>
        </div>
        <Link to="/instructor/dashboard/settings">
          <Button variant="secondary">Edit Bio</Button>
        </Link>
      </Card>
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991

      {/* CTA Banners */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ctaBanners.map((banner) => (
          <motion.div
            key={banner.title}
<<<<<<< HEAD
            className={`rounded-lg p-6 shadow-md ${banner.colorClass} dark:border dark:border-gray-700`}
=======
            className={`rounded-lg p-6 shadow-md ${banner.colorClass}`}
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991
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
<<<<<<< HEAD
              <Button variant={"secondary"}>{banner.title}</Button>
=======
              <Button variant="secondary">{banner.title}</Button>
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991
            </Link>
          </motion.div>
        ))}
      </section>
<<<<<<< HEAD
=======

      {/* Placeholder for Additional Widgets */}
      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grading Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Replace with actual grading summary */}
            <p className="text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Groups & Discussions</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Replace with actual group overview */}
            <p className="text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </section>
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991
    </div>
  );
};

export default InstructorHome;
