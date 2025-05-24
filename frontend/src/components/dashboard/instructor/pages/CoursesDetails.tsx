import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Wallet } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const revenueData = [
  { date: "Aug 01", value: 10000 },
  { date: "Aug 10", value: 51749 },
  { date: "Aug 20", value: 20000 },
];

const courseOverviewData = [
  { date: "Sun", views: 40, comments: 30 },
  { date: "Mon", views: 50, comments: 40 },
  { date: "Tue", views: 60, comments: 50 },
  { date: "Wed", views: 70, comments: 60 },
  { date: "Thu", views: 80, comments: 70 },
  { date: "Fri", views: 90, comments: 80 },
];

export default function CoursesDetails() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">2021 Complete Python Bootcamp</h2>
          <p className="text-sm text-gray-500">From Zero to Hero in Python</p>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <div>
            <p className="text-lg font-bold">$13.99</p>
            <p className="text-sm text-gray-500">Course Price</p>
          </div>
          <div>
            <p className="text-lg font-bold">$131,800,455.82</p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <Button>
            <Wallet className="mr-2 h-4 w-4" /> Withdraw Money
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Lectures", value: "1,957" },
          { label: "Students Enrolled", value: "9,419,418" },
          { label: "Course Level", value: "Beginner" },
          { label: "Language", value: "Mandarin" },
          { label: "Hours", value: "19:37:51" },
          { label: "Students Viewed", value: "76,395,167" },
        ].map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold">{item.value}</p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Overall Course Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold flex items-center">
              4.8 <Star className="text-yellow-500 ml-2" />
            </p>
            <p className="text-gray-500 text-sm">451,444 Ratings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid stroke="#eee" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={courseOverviewData}>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid stroke="#eee" />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#6366f1" />
                <Line type="monotone" dataKey="comments" stroke="#f59e0b" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}