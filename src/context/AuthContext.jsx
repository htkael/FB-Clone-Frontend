import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return response.data;
    } catch (err) {
      console.error(err);
      return err.response?.data || { success: false, message: "Login failed" };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      navigate("/feed");
      return response.data;
    } catch (err) {
      console.error(err);
      return (
        err.response?.data || { success: false, message: "Sign Up failed" }
      );
    }
  };

  const guestLogin = async () => {
    try {
      const response = await authAPI.guest_login();
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      navigate("/feed");
      return response.data;
    } catch (err) {
      console.error(err);
      return (
        err.response?.data || { success: false, message: "Guest log in failed" }
      );
    }
  };

  const logout = async () => {
    try {
      const response = await authAPI.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/");
      return response.data;
    } catch (err) {
      console.error(err);
      return (
        err.response?.data || { success: false, message: "Guest log in failed" }
      );
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    guestLogin,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
