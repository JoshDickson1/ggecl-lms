import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star } from "lucide-react";
import { Instructor } from "@/types/userTypes";

function InstructorBox({ instructor }: { instructor: Instructor }) {
  return (
    <Card className=" w-full cursor-pointer overflow-hidden rounded-2xl shadow-md transition hover:shadow-lg md:max-w-[17rem] dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="flex flex-col items-center gap-2 md:px-4 px-2">
        <div className="md:h-[220px] w-full overflow-hidden rounded-xl">
          <img
            src={instructor.picture}
            alt={`${instructor.fullName}'s profile`}
            className="h-full w-full object-cover"
          />
        </div>
        <CardTitle className="mt-2 text-center text-lg font-semibold capitalize">
          {instructor.fullName}
        </CardTitle>
        <CardDescription className="text-sm text-gray-400">
          {instructor.schRole}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-between border-t px-4 py-3 text-sm text-gray-300">
        <div className="flex items-center gap-1 font-medium">
          <Star className="h-4 w-4 fill-[#FFC806] stroke-none" />
          <span>{instructor.reviews.length}</span>
        </div>
        <span className="font-medium text-gray-400">
          {instructor.students.length} students
        </span>
      </CardContent>
    </Card>
  );
}

export default InstructorBox;
