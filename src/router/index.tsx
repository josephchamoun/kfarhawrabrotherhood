import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsersPage from "../pages/UsersPage";
import HomePage from "../pages/HomePage";
import EventsPage from "../pages/EventsPage";
import ShopsPage from "../pages/ShopsPage";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/shops" element={<ShopsPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
