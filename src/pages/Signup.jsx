import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  AtSymbolIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    password_conf: z.string(),
  })
  .refine((data) => data.password === data.password_conf, {
    message: "Passwords don't match",
    path: ["password_conf"],
  });

function Signup() {
  const { signup, guestLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setApiError("");
    setIsSubmitting(true);
    try {
      const result = await signup(data);
      if (result.success) {
        reset();
      }

      if (!result.success) {
        if (result.errors && Array.isArray(result.errors)) {
          setApiError(result.errors[0]?.msg || "Registration failed");
        } else {
          setApiError(result.message || "Registration failed");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      const result = await guestLogin();
      if (!result.success) {
        setApiError("An unexpected error occurred. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Join Climbing Connection and connect with friends
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-200 dark:border-gray-700">
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-r-lg"
            >
              <p className="text-sm text-red-700 dark:text-red-400">
                {apiError}
              </p>
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              <Input
                label="First name"
                name="firstName"
                id="firstName"
                type="text"
                required
                autoComplete="given-name"
                leftIcon={<UserIcon className="h-5 w-5 text-gray-400" />}
                error={errors.firstName?.message}
                {...register("firstName")}
              />

              <Input
                label="Last name"
                name="lastName"
                id="lastName"
                type="text"
                required
                autoComplete="family-name"
                leftIcon={<UserIcon className="h-5 w-5 text-gray-400" />}
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>

            <Input
              label="Email"
              name="email"
              id="email"
              type="email"
              required
              autoComplete="email"
              leftIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Username"
              name="username"
              id="username"
              type="text"
              required
              autoComplete="username"
              leftIcon={<AtSymbolIcon className="h-5 w-5 text-gray-400" />}
              error={errors.username?.message}
              {...register("username")}
            />

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Password
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                  <LockClosedIcon className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    bg-white dark:bg-gray-700 text-black dark:text-white 
                    ${
                      errors.password
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password_conf"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Confirm Password
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                  <LockClosedIcon className="h-5 w-5" />
                </div>
                <input
                  id="password_conf"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`block w-full pl-10 py-2 border rounded-lg shadow-sm 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    bg-white dark:bg-gray-700 text-black dark:text-white
                    ${
                      errors.password_conf
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  {...register("password_conf")}
                />
              </div>
              {errors.password_conf && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {errors.password_conf.message}
                </p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isSubmitting || !isValid}
                isLoading={isSubmitting}
              >
                Sign up
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
                variant="success"
                size="lg"
                fullWidth
                disabled={isLoading}
                isLoading={isLoading}
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
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/">
                <Button variant="outline" size="lg" fullWidth>
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Signup;
