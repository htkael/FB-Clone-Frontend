import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { MessagingProvider } from "./context/MessagingContext.jsx";
import { NotificationsProvider } from "./context/NotificationContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages.jsx";
import Users from "./pages/Users.jsx";
// import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <MessagingProvider>
              <NotificationsProvider>
                <ThemeProvider>
                  <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Signup />} />
                    <Route
                      path="/feed"
                      element={
                        <ProtectedRoute>
                          <Feed />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile/:userId"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/messages"
                      element={
                        <ProtectedRoute>
                          <Messages />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <ProtectedRoute>
                          <Users />
                        </ProtectedRoute>
                      }
                    />

                    {/* <Route path="*" element={<NotFound />} /> */}
                  </Routes>
                </ThemeProvider>
              </NotificationsProvider>
            </MessagingProvider>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
