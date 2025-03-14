import { useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";

import AnimatedLayout from "./AnimatedLayout";

const MainLayout = ({ children, openModal }) => {
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
          <main className="flex-1 py-6 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </AnimatedLayout>
      </div>
    </div>
  );
};

export default MainLayout;
