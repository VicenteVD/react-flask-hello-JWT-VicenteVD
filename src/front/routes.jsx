// Import necessary components and functions from react-router-dom.

import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import LoginRegister from "./pages/LoginRegister";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";



export const router = createBrowserRouter([
  {
    element: <Layout />, // navbar + outlet + footer
    children: [
      { path: "/", element: <Home /> },
      { path: "/menu", element: <Menu /> },
      { path: "/auth", element: <LoginRegister /> },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
