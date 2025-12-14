import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VerificationPage from "./pages/VerificationPage";
import GroupPage from "./pages/GroupPage";
import JoinGroupPage from "./pages/JoinGroupPage";

import RootLayout from "./layouts/RootLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/verify-status",
        element: <VerificationPage />,
      },
      {
        path: "/groups/:groupId",
        element: <GroupPage />,
      },
      {
        path: "/groups/join/:groupId",
        element: <JoinGroupPage />,
      }
    ]
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;