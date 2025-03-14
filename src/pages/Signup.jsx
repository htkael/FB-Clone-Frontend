import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// Import icons
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import Input from "../components/common/Input";
import Button from "../components/common/Button";

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
  const navigate = useNavigate();
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

  const onSubmit = async (data) => {
    setApiError("");
    setIsSubmitting(true);
    try {
      const result = await signup(data);
      if (result.success) {
        reset();
        navigate("/feed");
      } else {
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
      } else {
        navigate("/feed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
              className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-r-lg"
            >
              <p className="text-sm text-red-700 dark:text-red-400">
                {apiError}
              </p>
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <Input
                  label="First name"
                  name="firstName"
                  id="firstName"
                  type="text"
                  register={register}
                  error={errors.firstName?.message}
                  autoComplete="given-name"
                  leftIcon={<UserIcon className="h-5 w-5 text-gray-400" />}
                />
              </div>

              <div>
                <Input
                  label="Last name"
                  name="lastName"
                  id="lastName"
                  type="text"
                  register={register}
                  error={errors.lastName?.message}
                  autoComplete="family-name"
                  leftIcon={<UserIcon className="h-5 w-5 text-gray-400" />}
                />
              </div>
            </div>

            <div>
              <Input
                label="Email"
                name="email"
                id="email"
                type="email"
                register={register}
                error={errors.email?.message}
                autoComplete="email"
                leftIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div>
              <Input
                label="Username"
                name="username"
                id="username"
                type="text"
                register={register}
                error={errors.username?.message}
                autoComplete="username"
                leftIcon={<UserIcon className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div>
              <Input
                label="Password"
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                register={register}
                error={errors.password?.message}
                autoComplete="new-password"
                leftIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                }
              />
            </div>

            <div>
              <Input
                label="Confirm Password"
                name="password_conf"
                id="password_conf"
                type={showPassword ? "text" : "password"}
                register={register}
                error={errors.password_conf?.message}
                autoComplete="new-password"
                leftIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                isLoading={isSubmitting}
                variant="primary"
                size="lg"
                fullWidth
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
                disabled={isLoading}
                isLoading={isLoading}
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
