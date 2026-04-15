import { Toaster } from "@/components/ui/toaster";
import NavigationTracker from "@/lib/NavigationTracker";
import { pagesConfig } from "../pages.config";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
import ProtectedRoute from "@/components/ProtectedRoute";

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : () => null;

const LayoutWrapper = ({ children, currentPageName }) =>
  Layout ? (
    <Layout currentPageName={currentPageName}>{children}</Layout>
  ) : (
    <>{children}</>
  );

function App() {
  return (
    <Router
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <NavigationTracker />
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <LayoutWrapper currentPageName="profile">
                <Profile />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <LayoutWrapper currentPageName={mainPageKey}>
                <MainPage />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <ProtectedRoute>
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
        ))}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
