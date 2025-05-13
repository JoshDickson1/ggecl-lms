import { useEffect, useState } from "react";
import StudentHero from "@/components/landing/_components/StudentHero";
import sktech from "@/assets/images/sktech.svg";
import circle2 from "@/assets/images/circle2.png";
import { Button } from "@/components/ui/button";
import { FaArrowRight } from "react-icons/fa";
import { useCustomNavigate } from "@/hooks/useCustomNavigate";

function Hero() {
  const [counts, setCounts] = useState({
    courses: 0,
    students: 0,
    caseStudies: 0,
    instructors: 0,
  });

  const { navigate } = useCustomNavigate();

  useEffect(() => {
    const targetCounts = {
      courses: 250,
      students: 5000,
      caseStudies: 120,
      instructors: 50,
    };

    const incrementValues = {
      courses: 5,
      students: 100,
      caseStudies: 3,
      instructors: 2,
    };

    const interval = setInterval(() => {
      setCounts((prev) => {
        const newCounts = Object.keys(prev).reduce(
          (acc, key) => {
            const typedKey = key as keyof typeof prev;
            acc[typedKey] = Math.min(
              prev[typedKey] + incrementValues[typedKey],
              targetCounts[typedKey],
            );
            return acc;
          },
          {} as typeof prev,
        );

        if (
          Object.entries(newCounts).every(
            ([key, value]) => value === targetCounts[key as keyof typeof prev],
          )
        ) {
          clearInterval(interval);
        }

        return newCounts;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex w-full flex-col items-center justify-between bg-white px-4 pt-5 pb-36 text-gray-800 md:flex-row md:px-12 dark:bg-gray-900 dark:text-white">
      {/* Background Blur Effect */}
      <div className="pointer-events-none absolute top-16 -left-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>

      {/* Left Section - Hero Content */}
      <div className="w-full space-y-5 text-center md:w-1/2 md:text-left">
        <h1 className="mt-5 text-[1.7rem] leading-tight font-bold md:text-5xl md:leading-snug">
          Empower your future with courses tailored to{" "}
          <span className="mt-2 flex flex-col items-center text-blue-600 md:items-start">
            <p>your aspirations.</p>
            <img
              src={sktech}
              alt="Decorative Sketch"
              className="-mt-3 w-44 md:w-56"
            />
          </span>
        </h1>

        <p className="text-md leading-tighter font-light md:text-xl">
          Learn from world-class instructors, engage with interactive content,
          and become part of a thriving educational community.
        </p>

        <Button
          className="btn inline-flex h-fit w-fit items-center rounded-md font-semibold text-white"
          onClick={() => navigate("/login")}
        >
          Join us Today <FaArrowRight />
        </Button>
      </div>

      {/* Right Section - Student Illustration */}
      <div className="mt-10 flex w-full justify-center md:mt-0 md:ml-10 md:w-1/2">
        <StudentHero />
      </div>

      {/* Animated Circle Design */}
      <div className="animate-spin-slow pointer-events-none absolute top-2/4 right-14 left-12 hidden md:top-24">
        <img
          src={circle2}
          alt="Spinning Design"
          className="-mt-5 h-24 w-24 md:mt-5 md:h-28 md:w-28"
        />
      </div>

      {/* Stats Section */}
      <div className="absolute bottom-4 left-0 w-full px-2 text-center md:bottom-2 md:px-6">
        <div className="flex justify-center rounded-lg bg-gray-50 px-1 py-1 text-center shadow-md md:px-6 dark:bg-gray-800">
          {[
            { label: "Courses", value: counts.courses, suffix: "+" },
            { label: "Students", value: counts.students, suffix: "+" },
            { label: "Case Studies", value: counts.caseStudies, suffix: "+" },
            { label: "Instructors", value: counts.instructors, suffix: "+" },
          ].map((item, index) => (
            <div key={index} className="w-1/2 py-4 md:w-1/4">
              <h3 className="text-md font-bold text-gray-700 md:text-2xl dark:text-blue-100">
                {item.value}
                {item.suffix}
              </h3>
              <p className="text-sm text-gray-800 md:text-xl dark:text-gray-100">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Hero;
