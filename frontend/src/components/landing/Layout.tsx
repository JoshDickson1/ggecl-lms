import { Outlet } from "react-router";
import Navbar from "./_components/Navbar";
import Footer from "./pages/Footer";
import ScrollToTop from "../utils/ScrollToTop";

function Layout() {
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <div className="min-h-screen">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

export default Layout;
