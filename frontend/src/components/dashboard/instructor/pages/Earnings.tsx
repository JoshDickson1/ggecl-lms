import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CreditCard, PlusCircle } from "lucide-react";
import { FaCheckCircle, FaAsterisk } from "react-icons/fa"

const earningsData = [
  { date: "Aug 01", revenue: 50000 },
  { date: "Aug 07", revenue: 51749 },
  { date: "Aug 15", revenue: 53000 },
  { date: "Aug 20", revenue: 50500 },
  { date: "Aug 31", revenue: 54000 },
];

const withdrawHistory = [
  { date: "21 Sep, 2021", method: "Mastercard", amount: "American Express", status: "Pending" },
  { date: "21 Sep, 2021", method: "Visa", amount: "American Express", status: "Completed" },
  { date: "21 Sep, 2021", method: "Visa", amount: "American Express", status: "Completed" },
  { date: "21 Sep, 2021", method: "Mastercard", amount: "American Express", status: "Canceled" },
];

export default function Earnings() {
  return (
    <div className="p-6 space-y-6 text-gray-700 dark:text-gray-200 whitespace-nowrap">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xl text-gray-700 dark;text-gray-200">
        {["Total Revenue", "Current Balance", "Total Withdrawals", "Today Revenue"].map((title, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-xl font-bold -mt-5 text-gray-500 dark:text-gray-400">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-md -mt-5 text-gray-500 dark:text-gray-400">${
              [13804, 16593, 13184, 162][index]
            }</CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics Chart */}
      <div className="grid md:grid-cols-8 grid-cols-1 md:gap-4">
          <Card className="col-span-1 w-full md:col-span-5 md:mb-0 mb-5">
            <CardHeader>
              <CardTitle>Statistic</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={earningsData}  className="bg-[#3cff9a5f] dark:bg-gray-800">
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* Payment Cards */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Saved Card */}
              <div className="p-4 border rounded-lg flex items-center space-x-4 justify-between">
                <div className="bg-blue-500 text-white p-4 rounded-lg w-24 flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="font-semibold">VISA - 4855</p>
                  <p className="text-sm text-gray-500">Expires 04/25</p>
                </div>
              </div>

              {/* Add New Card */}
              <Button variant="outline" className="w-full flex items-center">
                <PlusCircle className="mr-2" />
                Add new card
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw & Cards Section */}
      <div className="grid md:grid-cols-2 grid-cols-1 md:gap-6">
        {/* Withdraw Money */}
        <Card className="md:mb-0 mb-5">
          <CardHeader>
            <CardTitle>Withdraw your money</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Payment Methods */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <CreditCard className="text-blue-500" />
               
                <div className="flex flex-row gap-2 items-center">
                    <span>4855</span>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                </div>
                <div>
                    <span>Josh Dickson</span>
                </div>
                <div>
                    <FaCheckCircle className="text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <CreditCard className="text-blue-500" />
               
                <div className="flex flex-row gap-2 items-center">
                    <span>4855</span>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                </div>
                <div>
                    <span>Josh Dickson</span>
                </div>
                <div>
                    <FaCheckCircle className="text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <CreditCard className="text-blue-500" />
               
                <div className="flex flex-row gap-2 items-center">
                    <span>4855</span>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                    <FaAsterisk size="6px"/>
                </div>
                <div>
                    <span>Josh Dickson</span>
                </div>
                <div>
                    <FaCheckCircle className="text-green-600" />
                </div>
              </div>

              <p className="text-sm text-gray-500">You will be redirected to PayPal for withdrawal.</p>

              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">$16,593.00</span>
                <Button className="btn text-gray-50">Withdraw Money</Button>
              </div>
            </div>
          </CardContent>
        </Card>
{/* Withdraw History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdraw History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawHistory.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.method}</TableCell>
                  <TableCell>{entry.amount}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs rounded-md ${
                        entry.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : entry.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      </div>

      
    </div>
  );
}