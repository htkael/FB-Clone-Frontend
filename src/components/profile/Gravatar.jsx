import { GravatarQuickEditor } from "@gravatar-com/quick-editor";
import { useSocket } from "../../context/SocketContext";
import { useEffect } from "react";
import Avatar from "../common/Avatar";

const Gravatar = ({ user }) => {
  const email = user.email;
  const { isUserOnline } = useSocket();
  const isOnline = isUserOnline(user.id);

  useEffect(() => {
    // Initialize after component is mounted
    const editor = new GravatarQuickEditor({
      email: email,
      editorTriggerSelector: `#edit-profile-${user.id}`,
      avatarSelector: `#gravatar-avatar-${user.id}`,
      scope: ["avatars"],
    });

    console.log("editor initialized", editor);

    // Cleanup function
    return () => {
      // Add cleanup here if GravatarQuickEditor provides a cleanup method
      console.log("editor cleanup");
    };
  }, [email, user]); // Re-initialize if email changes

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
      <div className="relative">
        <Avatar
          src={user.profilePicUrl}
          alt={`${user.firstName} ${user.lastName}`}
          size="xxl"
          isOnline={isOnline}
          className="border-4 border-white dark:border-gray-800 shadow-lg"
          id={`gravatar-avatar-${user.id}`} // Keep the ID as the library expects it
        />

        <button
          id={`edit-profile-${user.id}`} // Keep the ID as the library expects it
          className="absolute top-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-md transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Gravatar;
