import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Navbar from "./Navbar";
import Loading from "../Loading";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#d4d0c8", fontFamily: '"Tahoma", "MS Sans Serif", Arial, sans-serif' }}>
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
