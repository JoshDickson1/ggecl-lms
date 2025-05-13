import About from "./About";
import Categories from "./Categories";
import Hero from "./Hero";
import InstructorsList from "../_components/InstructorsList";
import CoursesList from "../_components/CoursesList";
import Testimonials from "./Testimonial";
import JoinAs from "./JoinAs";

function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <CoursesList />
      <InstructorsList />
      <JoinAs />
      <Testimonials />
      <About />
    </>
  );
}

export default Home;
