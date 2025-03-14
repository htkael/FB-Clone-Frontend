import Logo from "../../../public/Logo";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import NotificationButton from "../../components/notifications/NotificationButton";

const Header = ({ openModal }) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    // Only add the listener when the menu is open
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen, userMenuRef]);

  return (
    <header className="sticky top-0 z-10 shadow-sm">
      <nav className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link
            to="/feed"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <Logo />
            <span className="self-center text-xl font-semibold text-gray-800 whitespace-nowrap dark:text-white">
              Climbing Connection
            </span>
          </Link>

          <div className="flex items-center lg:order-2 gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Notification Button */}
                <NotificationButton />

                <div className="relative ml-3" ref={userMenuRef}>
                  <button
                    type="button"
                    className="flex text-sm bg-gray-200 rounded-full focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:focus:ring-blue-500 hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600 transition-all"
                    id="user-menu-button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    {user.profilePicUrl ? (
                      <img
                        className="w-9 h-9 rounded-full object-cover"
                        src={user.profilePicUrl}
                        alt="User"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </div>
                    )}
                  </button>
                  {/* Dropdown menu */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <Link
                        to={`/profile/${user.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Your Profile
                      </Link>
                      <button
                        onClick={() => openModal()}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Settings
                      </button>

                      <button
                        onClick={() => logout()}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-600 transition-colors focus:outline-none"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700 transition-colors focus:outline-none"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
