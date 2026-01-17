import { createBrowserRouter } from "react-router-dom";
import OldHome from "./pages/oldHome";
import RootLayout from "./pages/Layout";
import NotFound from "./pages/not-found";
import About from "./pages/about";
import Login from "./pages/login";
import Signup from "./pages/signup";
import PrivateRoute from "./pages/private-route";
import Dashboard from "./pages/dashboard";
import Pricing from "./pages/pricing";
import Features from "./pages/features";
import Contact from "./pages/contact";
import Blog from "./pages/blog";
import Docs from "./pages/docs";
import ErrorPage from "./pages/error";
import Home from "./pages/home";
import AuthCallback from "./pages/auth-callback";
import CreateRally from "./pages/create-rally";

export const router = createBrowserRouter([
  {
    path: "",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/oldHome",
        element: <OldHome />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/rejestracja",
        element: <Signup />,
      },
      {
        path: "/auth/callback",
        element: <AuthCallback />,
      },
      {
        path: "/pricing",
        element: <Pricing />,
      },
      {
        path: "/features",
        element: <Features />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/docs",
        element: <Docs />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "",
        element: <PrivateRoute />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/create-rally",
            element: <CreateRally />,
          },
        ],
      },
    ],
  },
]);
