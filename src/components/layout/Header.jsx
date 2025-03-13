import Logo from "../../../public/Logo";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import NotificationButton from "../../components/notifications/NotificationButton";

const Header = () => {
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
    <header className="sticky top-0 z-10">
      <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link to="/feed" className="flex items-center gap-2">
            <Logo />
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              Climbing Connection
            </span>
          </Link>

          <div className="flex items-center lg:order-2 gap-2">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Notification Button */}
                <NotificationButton />

                <div className="relative ml-3" ref={userMenuRef}>
                  <button
                    type="button"
                    className="flex text-sm bg-gray-800 rounded-full hover:ring-2 hover:ring-gray-300"
                    id="user-menu-button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    {user.profilePicUrl ? (
                      <img
                        className="w-8 h-8 rounded-full"
                        src={user.profilePicUrl}
                        alt="User"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </div>
                    )}
                  </button>
                  {/* Dropdown menu */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <Link
                        to={`/profile/${user.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => logout()}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                  className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
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
