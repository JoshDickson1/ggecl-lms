// ScrollToTop.tsx - Automatically scrolls to top on route change
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Component that scrolls the window to the top whenever the route changes.
 * 
 * Usage:
 * Place this component inside your Router but outside your Routes:
 * 
 * <BrowserRouter>
 *   <ScrollToTop />
 *   <Routes>
 *     <Route path="/" element={<Home />} />
 *     ...
 *   </Routes>
 * </BrowserRouter>
 * 
 * How it works:
 * - Uses React Router's useLocation hook to detect route changes
 * - Scrolls to top (0, 0) whenever the pathname changes
 * - Runs after the component renders (useEffect)
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top of the page
    window.scrollTo(0, 0);
    
    // Alternative: smooth scroll
    // window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]); // Re-run whenever the route changes

  return null; // This component doesn't render anything
}
