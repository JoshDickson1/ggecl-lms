import { useState } from "react";
import {
  FaArrowAltCircleLeft,
  FaArrowAltCircleRight,
  FaQuoteLeft,
} from "react-icons/fa";

const testimonials = [
  {
    text: "This platform has completely transformed the way I learn. The courses are easy to follow.",
    name: "Alice Johnson",
    role: "Business Administrator",
    image: "https://c.stocksy.com/a/3h0600/z9/1432637.jpg",
  },
  {
    text: "I love the variety of courses available. The instructors are knowledgeable and engaging.",
    name: "Maria Smith",
    role: "Hotel Manager",
    image: "https://i.pinimg.com/564x/0a/75/fa/0a75faad25a47835113b355f90f76124.jpg",
  },
  {
    text: "The support team is amazing! They helped me resolve an issue within minutes.",
    name: "Sophia Brown",
    role: "Healthcare Analyst",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5wJpFr-YXsJFuWonH3J0LIQBWdY4BMRS8fQ&s",
  },
  {
    text: "The user interface is intuitive and easy to navigate. Highly recommend this platform!",
    name: "James Wilson",
    role: "Finance Consultant",
    image: "https://i0.wp.com/attireclub.org/wp-content/uploads/2019/08/Sporty-Teen-Fashion.jpg?resize=274%2C500&ssl=1",
  },
  {
    text: "The quality of the content is top-notch. I've learned so much in such a short time.",
    name: "Emily Davis",
    role: "Education Specialist",
    image: "https://athoughtfulplaceblog.com/wp-content/uploads/2022/08/frist-day-of-school-1-800x1422.jpg",
  },
  {
    text: "Affordable and effective! This platform is a game-changer for online learning.",
    name: "Joan Martinez",
    role: "Project Coordinator",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRw_ukgTcbpbFnF3hrZ7HilrdAVPw8yQvdj_g&s",
  },
];


const Testimonial = () => {
  const [index, setIndex] = useState(0);

  const totalTestimonials = testimonials.length;
  const testimonialsPerView = window.innerWidth >= 1024 ? 4 : 1;
  const maxIndex = totalTestimonials - testimonialsPerView;

  const prevSlide = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const nextSlide = () => {
    setIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  return (
    <div className="relative w-full overflow-hidden bg-gray-900 py-10 px-4 md:px-16">
      <h1 className="text-3xl text-center md:text-left font-bold text-white">
        What our clients say about us
      </h1>

      <span className="flex gap-4 justify-end mb-4">
        <FaArrowAltCircleLeft
          onClick={prevSlide}
          className="text-4xl dark:text-gray-800 text-white cursor-pointer hover:scale-110 transition"
        />
        <FaArrowAltCircleRight
          onClick={nextSlide}
          className="text-4xl dark:text-gray-800 text-white cursor-pointer hover:scale-110 transition"
        />
      </span>

      <div className="w-full overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{
            transform: `translateX(-${index * (100 / testimonialsPerView)}%)`,
          }}
        >
          {testimonials.map((testimonial, i) => (
            <div key={i} className="min-w-[100%] lg:min-w-[25%] px-2">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-start">
                <FaQuoteLeft className="text-gray-500 text-2xl mb-3" />
                <p className="text-left text-gray-700 dark:text-white">
                  {testimonial.text}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <img
                    src={testimonial.image}
                    className="size-10 rounded-full bg-white object-center object-cover"
                    alt={testimonial.name}
                  />
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h3>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonial;