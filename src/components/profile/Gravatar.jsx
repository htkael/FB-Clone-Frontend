import { GravatarQuickEditor } from "@gravatar-com/quick-editor";
import { useSocket } from "../../context/SocketContext";
import { useEffect } from "react";
import Avatar from "../common/Avatar";
import { useAuth } from "../../context/AuthContext";

const Gravatar = ({ avatar }) => {
  const { user } = useAuth();
  const email = avatar.email;
  const { isUserOnline } = useSocket();
  const isOnline = isUserOnline(avatar.id);

  const isOwnProfile = user.id === avatar.id;

  useEffect(() => {
    const editor = new GravatarQuickEditor({
      email: email,
      editorTriggerSelector: `#edit-profile-${avatar.id}`,
      avatarSelector: `#gravatar-avatar-${avatar.id}`,
      scope: ["avatars"],
    });

    console.log("editor initialized", editor);

    return () => {
      console.log("editor cleanup");
    };
  }, [email, avatar]);

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
      <div className="relative">
        <Avatar
          src={avatar.profilePicUrl}
          alt={`${avatar.firstName} ${avatar.lastName}`}
          size="xxl"
          isOnline={isOnline}
          className="border-4 border-white dark:border-gray-800 shadow-lg"
          id={`gravatar-avatar-${avatar.id}`}
        />
        {isOwnProfile && (
          <button
            id={`edit-profile-${avatar.id}`}
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
        )}
      </div>
    </div>
  );
};

export default Gravatar;
