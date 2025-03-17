import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import toast, { Toaster } from "react-hot-toast";

import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

const postSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(500, "Post cannot exceed 500 characters"),
});

const PostForm = ({ onSubmit, isLoading: externalLoading }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [charCount, setCharCount] = useState(0);
  const [postSuccess, setPostSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
    getValues,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(postSchema),
    mode: "onChange",
  });

  const contentValue = watch("content");

  useEffect(() => {
    setCharCount(contentValue?.length || 0);
  }, [contentValue]);

  useEffect(() => {
    if (postSuccess) {
      const timer = setTimeout(() => {
        setPostSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [postSuccess]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log("File selected:", file);

    if (file) {
      console.log("File size:", file.size, "bytes");
      console.log("Max size:", 5 * 1024 * 1024, "bytes");

      if (file.size > 5 * 1024 * 1024) {
        console.log("File too large, showing toast");
        toast.error("Image size should be less than 5MB");
        e.target.value = "";
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
  };

  const resetAllState = () => {
    resetForm();
    setImage(null);
    setPreview("");
    setCharCount(0);
    setValue("content", "");
  };

  const createPostMutation = useMutation({
    mutationFn: postAPI.createPost,
    onSuccess: () => {
      toast.success("Post created successfully!");
      setPostSuccess(true);

      resetAllState();

      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.message || "Failed to create post");
    },
  });

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    formData.append("content", data.content);

    if (image) {
      formData.append("image", image);
    }

    if (onSubmit) {
      onSubmit(formData);

      resetAllState();
      setPostSuccess(true);
      toast.success("Post created successfully!");
    } else {
      createPostMutation.mutate(formData);
    }
  };

  const isSubmitting = externalLoading || createPostMutation.isLoading;
  const hasContent = getValues("content")?.trim().length > 0 || image;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const content = getValues("content");

      if (content && content.trim().length > 0) {
        handleSubmit(handleFormSubmit)(e);
      }
    }
  };

  return (
    <div>
      {/* Add Toaster component here */}
      <Toaster position="top-center" />

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <Avatar
            src={user?.profilePicUrl}
            alt={`${user?.firstName} ${user?.lastName}`}
            size="md"
          />
        </div>
        <div className="w-full">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="relative">
              <textarea
                className={`w-full border ${
                  errors.content
                    ? "border-red-300 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-xl p-4 pt-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 dark:text-white transition-colors resize-none`}
                placeholder="What's on your mind?"
                rows="3"
                onKeyDown={handleKeyDown}
                {...register("content", {
                  onChange: (e) => setCharCount(e.target.value.length),
                })}
              ></textarea>

              {/* Character counter */}
              <div
                className={`absolute bottom-2 right-3 text-xs ${
                  charCount > 450
                    ? charCount > 500
                      ? "text-red-500 dark:text-red-400"
                      : "text-amber-500 dark:text-amber-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {charCount}/500
              </div>
            </div>

            {errors.content && (
              <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">
                {errors.content.message}
              </p>
            )}

            {preview && (
              <div className="relative mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-60 w-full object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-1.5 text-white transition-colors"
                  aria-label="Remove image"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between mt-3 gap-2">
              <div className="flex space-x-1">
                <label className="cursor-pointer flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <PhotoIcon className="h-5 w-5 mr-1.5" />
                  <span className="text-sm">Photo</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {postSuccess && (
                <div className="text-green-500 dark:text-green-400 animate-pulse mr-3">
                  Posted successfully!
                </div>
              )}

              <Button
                type="submit"
                variant={hasContent ? "primary" : "primary"}
                size="md"
                disabled={!hasContent || isSubmitting}
                className={`ml-auto ${!hasContent ? "opacity-50" : ""}`}
                isLoading={isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
