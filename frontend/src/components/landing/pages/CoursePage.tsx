import { FaFacebook, FaGithub, FaGoogle, FaTwitter } from "react-icons/fa";
import { useParams } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import CourseBox, { DisplayRating } from "../_components/CourseBox";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseInfo from "../_components/CourseInfo";
import ListContainer from "@/components/ui/ListContainer";
import { GetCourseOutput } from "@/utils/trpc";
import { TInstructor } from "@/types/instructorType";
import { useAddCartItem } from "../hooks/useAddCartItem";
import { useCourses } from "@/hooks/useCourses";
import { useCoursesById } from "@/hooks/useCourseById";

const CoursePage = () => {
  const { id } = useParams<{ id: string }>();

  const { courses, loading } = useCourses({});

  const { singleCourse: course } = useCoursesById(id || "");

  if (!course) return "Course not found";

  const instructor = course.instructor as TInstructor;

  return (
    <section>
      <main className="relative text-gray-800 dark:bg-gray-900 dark:text-gray-200">
        <div className="grid grid-cols-1 bg-[#f8fafc] p-4 md:grid-cols-4 md:p-10 dark:bg-gray-800">
          <div className="md:col-span-3">
            <header>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/categories">
                      Categories
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-blue-500">
                      {course.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <h1 className="my-5 text-2xl font-bold md:my-7 md:text-4xl">
                {course.title}
              </h1>
            </header>

            <div className="flex flex-col gap-5">
              <p className="w-full text-sm md:w-[70%] md:text-base">
                {course.description}
              </p>

              <div className="flex flex-col md:h-[3vh] md:flex-row md:items-center md:space-x-3">
                <DisplayRating
                  rating={course.totalRating}
                  stars={course.totalStar}
                />
                <Separator
                  orientation="vertical"
                  className="hidden md:block dark:bg-gray-600"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span>{course.duration}</span> •{" "}
                  <span>{course.lectures} Lectures</span> •{" "}
                  <span>{course.level}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Avatar className="object-cover">
                  <AvatarImage src={instructor.picture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <p>
                  Created by{" "}
                  <span className="text-blue-500">{instructor.fullName}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Globe />
                <span className="text-sm text-gray-500">
                  English, Spanish, Italian, German.
                </span>
              </div>
            </div>
          </div>
        </div>

        <CourseInfo course={course} />

        <CourseAction course={course} />
      </main>

      {!loading && (
        <ListContainer
          header="Similar courses"
          path="/courses"
          render={courses.map((course) => (
            <CourseBox key={course._id.toString()} course={course} />
          ))}
        />
      )}
    </section>
  );
};

function CourseAction({ course }: { course: GetCourseOutput }) {
  const { addItemMutate, isAdding } = useAddCartItem(course.title);

  return (
    <div className="rounded-xl border border-gray-300/30 bg-gray-50 p-4 shadow-md md:absolute md:top-14 md:right-10 md:w-[18rem] dark:border-blue-300/20 dark:bg-gray-900">
      <div className="overflow-hidden rounded-lg md:max-h-36 md:max-w-[17rem]">
        <img
          src={course.img}
          className="w-full rounded-lg object-cover"
          alt={course.title}
        />
      </div>
      <div className="mt-4">
        <p className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            ${(course.price * 0.5).toFixed(2)}
          </span>
          <span className="text-gray-400 line-through">${course.price}</span>
          <span className="font-bold text-green-500">50% Off</span>
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        <Button
          disabled={isAdding}
          variant="outline"
          className="border-black font-semibold dark:border-blue-300/20 dark:bg-transparent"
          onClick={() => addItemMutate({ courseId: course._id.toString() })}
        >
          {isAdding ? "Adding to cart" : "Add To Cart"}
        </Button>
        <Button className="dark:text-gray-800">Buy Now</Button>
      </div>
      <Separator className="my-5" />
      <div className="flex justify-center gap-4 text-xl text-gray-800 dark:text-gray-400">
        <FaFacebook />
        <FaGithub />
        <FaGoogle />
        <FaTwitter />
      </div>
    </div>
  );
}

export default CoursePage;
