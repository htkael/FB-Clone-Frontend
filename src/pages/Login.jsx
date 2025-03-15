import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

// Import icons
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const Login = () => {
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login, guestLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const from = location.state?.from || "/feed";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!credentials.identifier) {
      newErrors.identifier = "Email or username is required";
    }
    if (!credentials.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const isEmail = credentials.identifier.includes("@");
      const loginData = {
        password: credentials.password,
      };

      if (isEmail) {
        loginData.email = credentials.identifier.trim();
      } else {
        loginData.username = credentials.identifier.trim();
      }

      const result = await login(loginData);
      if (!result.success) {
        setErrors({ general: result.message });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrors({
        general: "An unexpected error occurred. Please try again.",
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      const result = await guestLogin();
      if (!result.success) {
        setErrors({ general: result.message || "Guest login failed" });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrors({
        general: "An unexpected error occurred with guest login.",
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div variants={itemVariants} className="text-center">
          <img src="/logo.png" alt="Logo" className="mx-auto h-16 w-auto" />
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Climbing Connection
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Connect with friends and the climbing world around you
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-200 dark:border-gray-700">
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-r-lg"
            >
              <p className="text-sm text-red-700 dark:text-red-400">
                {errors.general}
              </p>
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                label="Email or username"
                name="identifier"
                id="identifier"
                type="text"
                required
                value={credentials.identifier}
                onChange={handleChange}
                error={errors.identifier}
                leftIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
                autoComplete="email username"
              />
            </div>

            <div>
              <Input
                label="Password"
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={credentials.password}
                onChange={handleChange}
                error={errors.password}
                leftIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
                autoComplete="current-password"
                rightIconClickable={true}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    {showPassword ? (
                      <EyeIcon className="h-5 w-5" />
                    ) : (
                      <EyeSlashIcon className="h-5 w-5" />
                    )}
                  </button>
                }
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading && !credentials.guest}
                variant="primary"
                size="lg"
                fullWidth
              >
                Log in
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleGuestLogin}
                disabled={isLoading}
                isLoading={isLoading && credentials.guest}
                variant="success"
                size="lg"
                fullWidth
                icon={<UserIcon className="w-5 h-5" />}
              >
                Guest Access
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  New to Climbing Connection?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/register">
                <Button variant="outline" size="lg" fullWidth>
                  Create New Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
