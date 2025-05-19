import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  FaStar,
  FaClock,
  FaUsers,
  FaListAlt,
  FaDollarSign,
} from "react-icons/fa";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCoursesById } from "@/hooks/useCourseById";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CourseMaterials } from "../_components/CourseMaterials";

const VideoPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const { singleCourse: course, loadingSingleCourse: loading } = useCoursesById(
    courseId || "",
  );

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-muted-foreground">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-red-500">Course not found.</p>
      </div>
    );
  }

  const avgRating =
    course.totalRating > 0
      ? (course.totalStar / course.totalRating).toFixed(1)
      : "0.0";

  const completedPercent = 0;

  return (
    <div className="container mx-auto grid gap-6 p-4 md:grid-cols-3 md:p-8">
      <div className="space-y-6 md:col-span-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link to="/student/dashboard">Home</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link to="/student/dashboard/courses">Courses</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-blue-300">
                {course.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* Video Player & Info */}
        <Card className="overflow-hidden">
          <div className="aspect-video bg-black px-2 md:px-2">
            <video
              controls
              className="h-80 w-full object-contain"
              src={course.videoUrl}
            />
          </div>
          <CardContent>
            <h2 className="mb-2 text-2xl font-bold">{course.title}</h2>
            <div className="mb-4 flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <FaClock /> <span>{course.duration}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaListAlt /> <span>{course.lectures} lectures</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaUsers /> <span>{course.students.length} students</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaStar className="text-yellow-500" /> <span>{avgRating}</span>
              </span>
              <Badge variant="outline">{course.level}</Badge>
              {course.badge && <Badge>{course.badge}</Badge>}
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-semibold">Progress</span>
              <span className="text-sm">{completedPercent}%</span>
            </div>
            <Progress value={completedPercent} className="h-3 rounded-full" />
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Card className="w-full">
          <Tabs defaultValue="overview" onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="dark:text-gray-300">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="curriculum" className="dark:text-gray-300">
                  Curriculum
                </TabsTrigger>
                <TabsTrigger value="reviews" className="dark:text-gray-300">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="stats" className="dark:text-gray-300">
                  Stats
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value={activeTab} className="space-y-4">
                {activeTab === "overview" && (
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Description</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {course.description}
                    </p>
                  </div>
                )}

                {activeTab === "curriculum" && (
                  <Accordion type="multiple" className="space-y-2">
                    {course.syllabus.map((lesson, index) => (
                      <AccordionItem key={index} value={`lesson-${index}`}>
                        <AccordionTrigger>{lesson}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground text-sm">
                            {lesson}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    {course.reviews.length === 0 ? (
                      <p>No reviews yet.</p>
                    ) : (
                      course.reviews.map((review, idx) => (
                        <Card key={idx}>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {review.reviewer}
                              </span>
                              <span className="flex items-center space-x-1">
                                <FaStar className="text-yellow-500" />{" "}
                                <span>{review.rating}</span>
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              {review.comment}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "stats" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center space-x-3 rounded-lg border p-4">
                      <FaUsers className="h-6 w-6 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Enrolled</p>
                        <p className="text-lg font-semibold">
                          {course.students.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border p-4">
                      <FaDollarSign className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="text-md font-semibold">
                          ${course.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border p-4">
                      {/* <FaAward className="h-6 w-6 text-purple-500" /> */}
                      <div>
                        <p className="text-sm text-gray-500">Certification</p>
                        <p className="text-sm font-semibold">
                          {course.certification}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
        <CourseMaterials
  sections={[
    {
      title: "Week 1 Materials",
      materials: [
        {
          id: "1",
          name: "Intro.pdf",
          type: "pdf",
          url: "/materials/intro.pdf",
          uploadedAt: "2025-05-19T08:30:00Z",
        },
        {
          id: "2",
          name: "design.png",
          type: "image",
          url: "https://i.pinimg.com/736x/57/5a/4d/575a4d10aca9c90cc706527c10f00cc8.jpg",
          uploadedAt: "2025-05-18T15:12:00Z",
        },
      ],
    },
    {
      title: "Week 2 Materials",
      materials: [
        {
          id: "3",
          name: "lecture.mp4",
          type: "video",
          url: "https://res.cloudinary.com/dtyrkuxep/video/upload/v1747484174/courses/68220b753b2c2a4d6891bc02/courses/68220b753b2c2a4d6891bc02/v-da906cec-f461-44e1-8270-22c301056f14.mp4",
          uploadedAt: "2025-05-17T20:45:00Z",
        },
        {
          id: "3",
          name: "lecture.mp4",
          type: "doc",
          url: "/materials/lecture.mp4",
          uploadedAt: "2025-05-17T20:45:00Z",
        },
        {
          id: "3",
          name: "lecture.mp4",
          type: "image",
          url: "/materials/lecture.mp4",
          uploadedAt: "2025-05-17T20:45:00Z",
        },
      ],
    },
  ]}
/>

      </div>

      <aside className="sticky top-20 space-y-4">
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">Syllabus</h3>
          <Accordion type="single" collapsible>
            {course.syllabus.map((lesson, i) => (
              <AccordionItem key={i} value={`synopsis-${i}`}>
                <AccordionTrigger>{lesson}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground text-sm">{lesson}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </aside>
      
    </div>
  );
};

export default VideoPage;
