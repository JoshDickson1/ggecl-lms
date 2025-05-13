import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DisplayRating } from "../_components/CourseBox";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slugify";
import { Key } from "react";
import { cn } from "@/lib/utils";
import { useCartItems } from "../hooks/useCartItems";
import { useDeleteCartItem } from "../hooks/useDeleteCartItem";

function Cart() {
  const { cartItems = [] } = useCartItems();

  const { deleteItem, isDeleting } = useDeleteCartItem();

  const totalPrice = cartItems.reduce((acc, course) => acc + course.price, 0);

  const discount = 0;
  const tax = 0;
  const finalTotal = totalPrice - discount + tax;

  return (
    <section className="grid w-full grid-cols-1 px-4 py-10 md:px-8 md:py-12 lg:grid-cols-3 dark:bg-gray-900">
      {/* Cart Section */}
      <main className="col-span-2">
        <header className="mb-7 flex flex-col items-baseline gap-2 md:flex-row md:gap-10">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Shopping Cart
          </h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-blue-500">
                  Shopping Cart
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="border-b py-1 text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {cartItems.length} {cartItems.length === 1 ? "Course" : "Courses"} in
          Cart
        </div>

        {/* Course List */}
        {cartItems.length !== 0 ? (
          <article className="mt-4 space-y-6">
            {cartItems.map((course) => (
              <div
                key={slugify(course._id) as Key}
                className="flex flex-col gap-2 rounded-md border p-4 md:flex-row md:gap-4 dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Course Image */}
                <div className="w-full overflow-hidden rounded-md md:h-24 md:w-44">
                  <img
                    src={course.img}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Course Details */}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {course.title}
                  </h2>
                  <p className="my-1 text-sm text-gray-500 dark:text-gray-400">
                    By {course.instructor}
                  </p>

                  <div className="flex flex-col md:h-[3vh] md:flex-row md:items-center md:space-x-3">
                    <DisplayRating
                      rating={course.totalRating}
                      stars={course.totalStar}
                    />
                    <Separator
                      orientation="vertical"
                      className="hidden md:block dark:bg-gray-600"
                    />
                    <p className="mt-1 space-x-2 text-xs text-gray-600 md:mt-0 dark:text-gray-400">
                      <span>{course.duration}</span>
                      <span>{course.lectures} Lectures</span>
                      <span>{course.level}</span>
                    </p>
                  </div>
                  <div className="mt-2 flex h-[3vh] space-x-3 text-sm">
                    <span className="cursor-pointer text-blue-500 dark:text-blue-400">
                      Save for later
                    </span>
                    <Separator orientation="vertical" />
                    <span
                      className={cn(
                        "cursor-pointer text-red-500 dark:text-red-400",
                        { "pointer-events-none": isDeleting },
                      )}
                      onClick={() => deleteItem({ itemId: course._id })}
                    >
                      {isDeleting ? "Removing" : "Remove"}
                    </span>
                  </div>
                </div>

                <div>
                  <h1 className="text-xl font-bold text-gray-700 dark:text-white">
                    ${course.price}
                  </h1>
                </div>
              </div>
            ))}
          </article>
        ) : (
          <div>
            <h1>No items in cart</h1>
          </div>
        )}
      </main>

      {/* Order Summary */}
      <aside className="col-span-1 mt-14 h-fit w-full rounded-lg border p-6 shadow-sm md:ml-auto lg:w-[20rem] dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Order Details
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Price</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Discount</span>
            <span className="text-red-500">-${discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <Separator className="my-2 dark:bg-gray-600" />
          <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
        <Button className="mt-4 w-full rounded-lg bg-black py-2 text-white transition duration-200 hover:bg-gray-800 dark:hover:bg-gray-700">
          Proceed to Checkout
        </Button>
      </aside>
    </section>
  );
}

export default Cart;
