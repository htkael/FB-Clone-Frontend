// src/pages/NotFound.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HomeIcon } from "@heroicons/react/24/outline";
import Button from "../components/common/Button";

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4"
    >
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-blue-500 dark:text-blue-400">
          404
        </h1>
        <div className="w-full border-t border-gray-300 dark:border-gray-700 my-4"></div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/feed">
          <Button
            variant="primary"
            size="lg"
            icon={<HomeIcon className="w-5 h-5" />}
            className="mx-auto"
          >
            Go to Home
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFound;
