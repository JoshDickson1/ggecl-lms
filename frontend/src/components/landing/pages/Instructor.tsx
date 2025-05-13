import f1 from "@/assets/images/f1.png";

const Instructor = () => {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 min-h-screen p-5 md:p-10 transition-all relative">
      <div className="absolute top-2 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="flex flex-col gap-2">
        <p className="mb-6">Instructor</p>
        <div className="md:w-max">
          <h1 className="text-2xl md:text-4xl font-bold">Ronald Richards</h1>
          <p className="text-gray-600 dark:text-gray-500">
            Web Developer, UI/UX Designer, and Teacher
          </p>
          <div className="flex gap-4 mt-6 ">
            <div>
              <label className="text-gray-600 dark:text-gray-500">
                Total Students
              </label>
              <h1 className="text-xl md:text-2xl font-bold">1000</h1>
            </div>
            <div>
              <label className="text-gray-600 dark:text-gray-500">
                Reviews
              </label>
              <h1 className="text-xl md:text-2xl font-bold">154</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Image & Buttons Section - Responsive Positioning */}
      <div className="md:mb-0 mb-20  flex flex-col gap-10 md:absolute top-28 right-24 md:flex md:w-auto md:-mt-10 mt-10">
        <div className="flex justify-center md:justify-end">
          <img
            src={f1}
            className="rounded-full w-52 h-52 md:w-52 md:h-52 object-cover"
            alt=""
          />
        </div>
        <div className="flex flex-col gap-2">
          <button className="btn-trans rounded-lg px-14 py-2">Website</button>
          <button className="btn-trans rounded-lg px-14 py-2">Portfolio</button>
          <button className="btn-trans rounded-lg px-14 py-2">Contact</button>
        </div>
      </div>

      <div className="flex flex-col gap-6 mt-6">
        <div>
          <h1 className="mb-2 mt-2 font-bold text-xl">About Ronald Richards</h1>
          <p className="w-full md:w-[60%] text-gray-600 dark:text-gray-500">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti
            quas dicta nostrum eos recusandae cupiditate, ipsam maiores!
            Mollitia, accusantium temporibus. Lorem, ipsum dolor sit amet
            consectetur adipisicing elit. Fugit quasi, perspiciatis dolore
            consequuntur corrupti magnam!
          </p>
        </div>
        <div>
          <h1 className="mb-3 mt-4 font-bold text-xl">Areas of Expertise</h1>
          <ul className="list-disc text-gray-600 dark:text-gray-500">
            <li className="ml-5">Lorem ipsum dolor sit amet consectetur.</li>
            <li className="ml-5">Lorem ipsum dolor sit amet consectetur.</li>
            <li className="ml-5">Lorem ipsum dolor sit amet consectetur.</li>
            <li className="ml-5">Lorem ipsum dolor sit amet consectetur.</li>
            <li className="ml-5">Lorem ipsum dolor sit amet consectetur.</li>
            <li className="ml-5">Lorem ipsum dolor sit amet consectetur.</li>
            <li className="ml-5">Lorem ipsum dolor sit amet consectetur.</li>
            <li className="ml-5">Lorem ipsum dolor sit amet consectetur.</li>
          </ul>
        </div>
        <div className="mb-14 ">
          <h1 className="mb-2 mt-2 font-bold text-xl">
            Professional Experience
          </h1>
          <p className="w-full md:w-[60%] text-gray-600 dark:text-gray-500">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aliquid
            porro expedita reiciendis! Ipsa velit nobis, enim maiores minima
            officia placeat!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Instructor;
