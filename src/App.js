import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import "./App.css";
import Layout from "./layout/Layout";
import ErrorPage from "./pages/ErrorPage";
import DashBoard from "./pages/dasboard";
import LoginPage from "./pages/login";

function App() {
  const route = createBrowserRouter([
    {
      // path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/:id",
          element: <DashBoard />,
        },
        {
          path: "/",
          element: <LoginPage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={route} />;
}

export default App;
