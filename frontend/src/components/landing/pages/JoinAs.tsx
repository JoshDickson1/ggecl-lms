import teacherImg from "@/assets/images/Asset3.png";
import studentImg from "@/assets/images/Asset2.png";
import { Button } from "@/components/ui/button";
import { FaArrowRight } from "react-icons/fa";
import { useCustomNavigate } from "@/hooks/useCustomNavigate";

function JoinAs() {
  const { navigate } = useCustomNavigate();
  return (
    <section className="w-full space-y-8 bg-white p-5 text-gray-800 md:p-12 dark:bg-gray-900 dark:text-white">
      <div className="flex flex-col items-center justify-center gap-5 md:flex-row md:gap-16">
        <div className="w-[20rem]">
          <img
            src={teacherImg}
            alt="Become an Instructor"
            className="h-auto w-full rounded-lg object-cover"
          />
        </div>

        <div className="flex w-full flex-col gap-4 md:max-w-[35rem]">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-100">
            Become an Instructor
          </h2>
          <p className="text-md text-gray-600 dark:text-gray-300">
            Empower learners globally by sharing your expertise. Enjoy access to
            advanced tools and comprehensive resources designed to elevate your
            teaching experience.
          </p>
          <Button
            className="btn inline-flex w-fit items-center rounded-md px-5 py-4 font-semibold text-white"
            onClick={() => navigate("/instructor/login")}
          >
            Embark on Your Instructor Journey <FaArrowRight />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-5 md:flex-row-reverse md:gap-16">
        <div className="w-[20rem]">
          <img
            src={studentImg}
            alt="Enroll as a Student"
            className="h-auto w-full rounded-lg object-cover"
          />
        </div>

        <div className="flex w-full flex-col gap-4 md:w-1/2 md:pl-12">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-100">
            Enroll as a Student
          </h2>
          <p className="text-md text-gray-600 dark:text-gray-300">
            Access insights from industry leaders and world-class educational
            content. Begin your journey to mastering essential skills and
            advancing your career.
          </p>
          <Button
            className="btn inline-flex w-fit items-center rounded-md px-5 py-4 font-semibold text-white"
            onClick={() => navigate("/login")}
          >
            Begin Your Learning Journey <FaArrowRight />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default JoinAs;
