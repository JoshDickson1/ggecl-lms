import image1 from "@/assets/images/img1.png";
import image2 from "@/assets/images/img2.png";
import image3 from "@/assets/images/img3.png";
import image4 from "@/assets/images/img4.png";

function Cta() {
  const steps = [
    {
      img: image1,
      title: "Sign Up",
      desc: "Create your account to get started.",
    },
    {
      img: image2,
      title: "Choose a Course",
      desc: "Select from a variety of courses.",
    },
    {
      img: image3,
      title: "Start Learning",
      desc: "Engage with interactive content.",
    },
    {
      img: image4,
      title: "Get Certified",
      desc: "Complete courses and earn certificates.",
    },
  ];

  return (
    <div className="reveal transition-all duration-500 ease-in-out">
      {/* How to Start Section */}
      <section className="flex flex-col items-center bg-gray-900 py-16 px-4 relative">
        {/* Background Blur Effect */}
        <div className="absolute inset-0 bg-blue-500/10 -top-10 right-0 w-72 h-72 rounded-full blur-2xl"></div>

        {/* Section Title */}
        <h1 className="text-md md:text-lg bg-gray-100 text-gray-800 md:py-2 py-3 px-6 rounded-full font-semibold mb-6">
          How to Start
        </h1>

        {/* Section Description */}
        <p className="text-gray-300 text-center max-w-2xl mb-10 leading-relaxed">
          Begin your journey with our easy steps. Learn, explore, and grow with
          the best courses designed for your success.
        </p>

        {/* Steps Section */}
        <div className="flex md:flex-nowrap flex-wrap justify-center gap-6 w-full max-w-6xl">
          {steps.map((item, index) => (
            <div
              key={index}
              className="bg-gray-800 text-white rounded-xl shadow-lg p-5 w-full sm:w-1/2 lg:w-1/4 text-center flex flex-col items-center justify-center hover:scale-102 transition gap-1"
            >
              {/* Step Icon */}
              <img
                src={item.img}
                alt={item.title}
                className="relative z-10 w-12 object-contain"
              />

              {/* Step Title & Description */}
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Cta;
