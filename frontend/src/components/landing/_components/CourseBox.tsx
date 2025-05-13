import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StarIcon, ShoppingCart, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCustomNavigate } from "@/hooks/useCustomNavigate";
import { useAddCartItem } from "../hooks/useAddCartItem";
import { slugify } from "@/lib/slugify";
import type { ICourseSummary } from "@/utils/trpc";


function CourseBox({ course }: { course: ICourseSummary }) {
  const { navigate } = useCustomNavigate();
  const { addItemMutate, isAdding } = useAddCartItem(course.title);

  const instructor = course.instructor as {
    _id: string;
    fullName: string;
    picture: string;
  };

  const handleNavigateToCourse = () => {
    navigate(`/courses/${course._id}?title=` + slugify(course.title));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItemMutate({ courseId: course._id.toString() });
  };

  return (
    <Card
      className="flex w-full cursor-pointer flex-col gap-2 py-2 shadow-sm xl:max-w-[17rem] dark:border-gray-800 dark:bg-gray-900"
      onClick={handleNavigateToCourse}
      role="link"
      aria-label={`View details for ${course.title}`}
    >
      <CardHeader className="relative flex-shrink-0 px-3 pt-2 pb-1">
        <Badge
          className={cn(
            "absolute top-2 left-2 z-10 w-fit rounded-sm bg-black px-2 py-0.5 text-xs text-white dark:bg-white dark:text-black",
            {
              hidden: !course?.badge,
            },
          )}
        >
          {course.badge}
        </Badge>

        <div className="mb-2 aspect-video overflow-hidden rounded-md">
          {" "}
          {/* Maintain aspect ratio */}
          <img
            src={course.img}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <CardTitle className="line-clamp-2 text-lg font-semibold tracking-tight text-gray-800 dark:text-white">
          {" "}
          {/* Use line-clamp */}
          {course.title}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          By {instructor?.fullName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow px-3">
        {" "}
        <DisplayRating rating={course.totalRating} stars={course.totalStar} />
        <p className="mt-1 line-clamp-1 text-xs text-gray-600 dark:text-gray-400">
          <span>{course.duration}</span> &bull;
          <span>{course.lectures} Lectures</span> &bull;{" "}
          <span>{course.level}</span>
        </p>
      </CardContent>
      <CardFooter className="flex-shrink-0 items-center justify-between px-3 pt-1 pb-2">
        <span className="text-lg font-bold text-gray-800 dark:text-white">
          ${course.price.toFixed(2)}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-gray-300 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          onClick={handleAddToCart}
          disabled={isAdding}
          aria-label={`Add ${course.title} to cart`}
        >
          {isAdding ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function DisplayRating({
  maxRating = 5,
  rating,
  stars,
}: {
  rating: number;
  maxRating?: number;
  stars: number;
}) {
  return (
    <aside className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: maxRating }, (_, i) => (
          <Star key={i} full={i + 1 <= stars} />
        ))}
      </div>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
        ({rating} Ratings)
      </span>
    </aside>
  );
}

export function Star({
  full,
  className,
}: {
  full: boolean;
  className?: string;
}) {
  return full ? (
    <StarIcon
      className={cn(
        "h-4 w-4 fill-[#FFC806] stroke-none text-[#FFC806]",
        className,
      )}
    />
  ) : (
    <StarIcon
      className={cn(
        "h-4 w-4 fill-[#b1b1b1] stroke-none text-[#b1b1b1]",
        className,
      )}
    />
  );
}

export default CourseBox;
