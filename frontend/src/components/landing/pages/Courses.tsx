import { Filter, Search } from "lucide-react";
import { useMemo } from "react";

// Shadcn UI Components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// Custom Components & Hooks
import CourseBox, { Star } from "../_components/CourseBox";
import InstructorBox from "../_components/InstructorBox";
import ListContainer from "@/components/ui/ListContainer";
import { useCourses } from "@/hooks/useCourses";
import { useInstructors } from "@/hooks/useInstructors";

const filterOptions = {
  rating: Array.from({ length: 5 }, (_, i) => 5 - i), // 5 stars down to 1 star
  chapters: ["1-10", "11-20", "21-30", "31+"],
  price: ["Free", "$1-$49", "$50-$99", "$100+"],
  category: [
    "Web Development",
    "App Development",
    "Data Science",
    "Design",
    "Marketing",
  ],
};

const CourseSkeleton = () => (
  <div className="flex flex-col space-y-3">
    <Skeleton className="h-[175px] w-full rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  </div>
);

const Courses = () => {
  const { courses, loading: loadingCourses } = useCourses({ limit: 100 });
  const { instructors, loading: loadingInstructors } = useInstructors({});

  // Memoize filter sections to avoid recreating on every render
  const filterSections = useMemo(
    () => [
      {
        title: "Rating",
        content: (
          <div className="space-y-2 pb-2">
            {filterOptions.rating.map((rate) => (
              <div key={rate} className="flex items-center space-x-2">
                <Checkbox id={`rating-${rate}`} />
                <Label
                  htmlFor={`rating-${rate}`}
                  className="flex cursor-pointer"
                >
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className="size-5 text-yellow-400"
                      full={j < rate}
                    />
                  ))}
                </Label>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Chapters",
        content: (
          <div className="space-y-2 pb-2">
            {filterOptions.chapters.map((range) => (
              <div key={range} className="flex items-center space-x-2">
                <Checkbox id={`chapters-${range}`} />
                <Label
                  htmlFor={`chapters-${range}`}
                  className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {range}
                </Label>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Price",
        content: (
          <div className="space-y-2 pb-2">
            {filterOptions.price.map((priceRange) => (
              <div key={priceRange} className="flex items-center space-x-2">
                <Checkbox id={`price-${priceRange}`} />
                <Label
                  htmlFor={`price-${priceRange}`}
                  className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {priceRange}
                </Label>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Category",
        content: (
          <div className="space-y-2 pb-2">
            {filterOptions.category.map((cat) => (
              <div key={cat} className="flex items-center space-x-2">
                <Checkbox id={`category-${cat}`} />
                <Label
                  htmlFor={`category-${cat}`}
                  className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {cat}
                </Label>
              </div>
            ))}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <div className="bg-background text-foreground relative min-h-screen">
        {/* Decorative Element */}
        <div className="absolute top-2 right-0 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>

        <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
          <header className="mb-12 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Explore Courses
            </h1>
            <div className="relative w-full md:w-64 lg:w-80">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="bg-background w-full rounded-lg pl-8"
              />
            </div>
          </header>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Filter Section */}
            <aside className="col-span-1 md:col-span-4 lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center text-lg font-semibold">
                  <Filter className="mr-2 h-5 w-5" /> Filters
                </h2>
                {/* Optional: Add a Clear All button */}
                {/* <Button variant="ghost" size="sm">Clear All</Button> */}
              </div>
              <Accordion type="multiple" className="w-full">
                {filterSections.map((section) => (
                  <AccordionItem key={section.title} value={section.title}>
                    <AccordionTrigger className="text-base font-medium">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent>{section.content}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </aside>

            {/* Courses Section */}
            <section className="col-span-1 md:col-span-8 lg:col-span-9">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {loadingCourses
                  ? Array.from({ length: 12 }).map((_, index) => (
                      <CourseSkeleton key={index} />
                    ))
                  : courses.map((course) => (
                      <CourseBox key={course._id.toString()} course={course} />
                    ))}
              </div>
              {/* Optional: Add Pagination Controls Here */}
            </section>
          </div>
        </main>
      </div>

      {/* Popular Mentors Section - Assuming ListContainer is styled well */}
      <div>
        <ListContainer
          isLoading={loadingInstructors}
          header="Popular Mentors"
          path="/instructors"
          render={instructors.map((instructor) => (
            <InstructorBox
              key={instructor._id.toString()}
              instructor={instructor}
            />
          ))}
        />
      </div>
    </>
  );
};

export default Courses;
