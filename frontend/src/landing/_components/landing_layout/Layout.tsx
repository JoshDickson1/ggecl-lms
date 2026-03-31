import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Navbar from "./Navbar";
import Loading from "../Loading";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1d] flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
        <Footer />
    </div>
  );
};

export default Layout;