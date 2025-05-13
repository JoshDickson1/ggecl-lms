import {
  Star,
  Users,
  FileText,
  Clock,
  Globe,
  Layers,
  MessageCircle,
  Download,
} from "lucide-react";
import { FaChartLine } from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import img from "@/assets/images/temp-course-img.png";
import profileImg from "@/assets/images/Frame 427319048.png";
import CourseRating from "../_components/CourseRating";

const SingleCourse = () => {
  const revenueData = [
    { date: "Aug 01", revenue: 750000 },
    { date: "Aug 7", revenue: 75000 },
    { date: "Aug 9", revenue: 750000 },
    { date: "Aug 12", revenue: 51749 },
    { date: "Aug 20", revenue: 650000 },
    { date: "Aug 31", revenue: 800000 },
  ];

  const profileViews = [
    { day: "Mon", views: 500 },
    { day: "Tue", views: 700 },
    { day: "Wed", views: 400 },
    { day: "Thu", views: 900 },
    { day: "Fri", views: 650 },
    { day: "Sat", views: 800 },
    { day: "Sun", views: 750 },
  ];

  return (
    <div className="p-6 text-gray-700 dark:text-gray-200">
      {/* Top Section - Course Info */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-6">
        {/* Course Image */}
        <div className="flex-shrink-0">
          <img
            src={img}
            alt="Course"
            className="w-full md:w-72 h-auto md:h-full object-cover rounded-md"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between gap-2">
          <p className="text-sm text-gray-400">
            Updated: Jan 21, 2020 | Last Updated: Sep 11, 2021
          </p>
          <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">
            2021 Complete Python Bootcamp From Zero to Hero in Python
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            3 in 1 Course: Learn to design websites with Figma, Webflow, and
            make a living freelancing.
          </p>

          <div className="flex md:flex-row flex-col gap-2 w-full justify-between md:items-center">
            <div className="mt-4 flex items-center gap-4">
              <img
                src={profileImg}
                alt="Instructor"
                className="w-10 h-10 rounded-full object-cover"
              />
              <p className="text-gray-900 dark:text-white">
                Kevin Gilbert • Kristin Watson
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Star className="text-yellow-400 w-5 h-5" />
              <p className="text-gray-900 dark:text-white font-medium">
                4.8{" "}
                <span className="text-gray-500 text-sm">(615,441 Ratings)</span>
              </p>
            </div>
          </div>
          <div className="flex md:flex-row flex-col gap-2 w-full justify-between md:items-center">
            <div className="mt-4 flex gap-6">
              <p className="text-lg font-semibold text-blue-600">$13.99</p>
              <p className="text-lg font-semibold text-green-600">
                $131,800,455.82
              </p>
            </div>

            <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700 md:w-max w-full">
              Withdraw Money
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          {[
            {
              icon: <FileText className="text-blue-500" />,
              value: "1,957",
              label: "Lectures (219.3 GB)",
            },
            {
              icon: <MessageCircle className="text-purple-500" />,
              value: "51,429",
              label: "Total Comments",
            },
            {
              icon: <Users className="text-red-500" />,
              value: "9,419,418",
              label: "Students Enrolled",
            },
            {
              icon: <Layers className="text-green-500" />,
              value: "Beginner",
              label: "Course Level",
            },
            {
              icon: <Globe className="text-orange-500" />,
              value: "Mandarin",
              label: "Course Language",
            },
            {
              icon: <Download className="text-yellow-500" />,
              value: "142",
              label: "Attach File (1.4 GB)",
            },
            {
              icon: <Clock className="text-gray-500" />,
              value: "19:37:51",
              label: "Hours",
            },
            {
              icon: <FaChartLine className="text-gray-700" />,
              value: "76,395,167",
              label: "Students Viewed",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md flex items-center gap-4"
            >
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="">
          <CourseRating
            overallRating={4.6}
            ratingsDistribution={[
              { stars: 5, percentage: 56 },
              { stars: 4, percentage: 37 },
              { stars: 3, percentage: 8 },
              { stars: 2, percentage: 1 },
              { stars: 1, percentage: 0.5 },
            ]}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-900 shadow-md p-4 rounded-md">
          <div className="flex flex-row justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Revenue</h3>
            <p className="text-gray-500">This Month</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Profile Views */}
        <div className="bg-white dark:bg-gray-900 shadow-md p-4 rounded-md">
          <h3 className="text-lg font-semibold">Profile Views</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={profileViews}>
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="views" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-gray-500 font-semibold text-center">
            $7,443 earned
          </p>
        </div>
      </div>
    </div>
  );
};

export default SingleCourse;
