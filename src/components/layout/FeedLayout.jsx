import { useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";
import MobileNavBar from "./MobileNavbar";
import AnimatedLayout from "./AnimatedLayout";

const FeedLayout = ({ children, openModal }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header openModal={openModal} />
      <div className="flex flex-1">
        <Sidebar />
        <AnimatedLayout>
          <main className="flex-1 py-6 px-4 sm:px-6 md:px-8 w-full overflow-y-auto xs:py-2 ">
            {/* Removed max-w-7xl and inner div with max-w-6xl to allow custom layout in Feed */}
            {children}
          </main>
        </AnimatedLayout>
      </div>
      <MobileNavBar />
    </div>
  );
};

export default FeedLayout;
