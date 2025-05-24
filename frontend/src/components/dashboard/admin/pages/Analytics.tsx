import { FC } from "react";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";

// Define types for chart data
interface LineData {
  name: string;
  value: number;
}

interface BarData {
  name: string;
  Men: number;
  Women: number;
  NotSpecific: number;
}

interface PieData {
  name: string;
  value: number;
  color: string;
}

// Line Chart Data
const lineData: LineData[] = [
  { name: "Dec 24", value: 20000 },
  { name: "Dec 25", value: 25000 },
  { name: "Dec 26", value: 35000 },
  { name: "Dec 27", value: 30000 },
  { name: "Dec 28", value: 40000 },
  { name: "Dec 29", value: 35000 },
  { name: "Dec 30", value: 37000 },
  { name: "Dec 31", value: 39000 },
];

// Bar Chart Data
const barData: BarData[] = [
  { name: "Dec 25", Men: 600000, Women: 700000, NotSpecific: 400000 },
  { name: "Dec 26", Men: 550000, Women: 650000, NotSpecific: 350000 },
  { name: "Dec 27", Men: 700000, Women: 750000, NotSpecific: 500000 },
  { name: "Dec 28", Men: 680000, Women: 730000, NotSpecific: 480000 },
  { name: "Dec 29", Men: 720000, Women: 770000, NotSpecific: 510000 },
  { name: "Dec 30", Men: 710000, Women: 760000, NotSpecific: 500000 },
  { name: "Dec 31", Men: 730000, Women: 780000, NotSpecific: 520000 },
];

// Pie Chart Data
const pieData: PieData[] = [
  { name: "Sent", value: 2300, color: "#2563EB" },
  { name: "Received", value: 274, color: "#60A5FA" },
];

const Analytics: FC = () => {
  return (
    <div className="p-6  min-h-screen">
      
      {/* Stats Cards */}
      <div className="md:grid flex-flex-col md:grid-cols-4 gap-4 mb-6">
        <div className="p-4  shadow-md rounded-lg text-center">
          <h2 className="text-xl font-semibold">12,540K</h2>
          <p className="">Active Students & Instructors</p>
        </div>
        <div className="p-4  shadow-md rounded-lg text-center">
          <h2 className="text-xl font-semibold">450</h2>
          <p className="">Approved & Live Courses</p>
        </div>
        <div className="p-4  shadow-md rounded-lg text-center">
          <h2 className="text-xl font-semibold">3,200K</h2>
          <p className="">Enrolled</p>
        </div>
        <div className="p-4  shadow-md rounded-lg text-center">
          <h2 className="text-xl font-semibold">$1.25M</h2>
          <p className="">Last 30 Days Revenue</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className=" shadow-md p-6 rounded-lg mb-6">
        <h3 className="font-semibold text-lg mb-4">Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Section */}
      <div className="md:grid flex-flex-col md:grid-cols-2 gap-6">
        
        {/* Audience Insight Bar Chart */}
        <div className=" shadow-md p-6 rounded-lg">
          <h3 className="font-semibold text-lg mb-4">Audience Insight</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Men" width={200} fill="#2563EB" />
              <Bar dataKey="Women" fill="#60A5FA" />
              <Bar dataKey="NotSpecific" fill="#93C5FD" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Email Activity Donut Chart */}
        <div className=" shadow-md p-6 rounded-lg flex justify-center">
          <div>
            <h3 className="font-semibold text-lg mb-4 text-center">Email Activity</h3>
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={100}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p>Email Sent: <span className="font-semibold">2300</span></p>
              <p>Received: <span className="font-semibold">274</span></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
