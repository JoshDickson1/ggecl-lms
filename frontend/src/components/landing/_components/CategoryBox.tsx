import { useCustomNavigate } from "@/hooks/useCustomNavigate";
import { slugify } from "@/lib/slugify";
import { JSX } from "react";

interface CategoriesType {
  category: {
    course: string;
    volume: number;
    img: JSX.Element;
  };
}

function CategoryBox({ category }: CategoriesType) {
  const { navigate } = useCustomNavigate();

  function handleCategoryClick() {
    const tag = slugify(category.course);
    navigate(`/courses/?category=${tag}`);
  }

  return (
    <div
      className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-blue-300/20 p-5 shadow-md transition duration-300 ease-in-out hover:-translate-y-1 md:max-w-[17rem]"
      onClick={handleCategoryClick}
    >
      <div className="inline-flex size-20 items-center justify-center rounded-full bg-blue-300">
        {category.img}
      </div>

      <h2 className="text-lg font-semibold">{category.course}</h2>

      <p className="text-md font-light text-gray-800 dark:text-gray-200">
        {category.volume} Courses
      </p>
    </div>
  );
}

export default CategoryBox;
