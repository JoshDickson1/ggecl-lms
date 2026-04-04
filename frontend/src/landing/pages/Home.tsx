import CategoriesPreview from "../_components/CategoriesPreview"
import CoursesPreview from "../_components/CoursesPreview"
import Hero from "../_components/Hero"
import InstructorsPreview from "../_components/InstructorsPreview"
import JoinAs from "../_components/JoinAs"
import Testimonial from "../_components/Testimonial"

const Home = () => {
  return (
    <div>
      {/* Hero */}
      <Hero />
      {/* Courses Preview */}
      <CoursesPreview />
      {/* Categories Preview */}
      <CategoriesPreview />
      {/* Instructors Preview */}
      <InstructorsPreview />
      {/* Join As */}
      <JoinAs />
      {/* Testimonial */}
      <Testimonial />
    </div>
  )
}

export default Home