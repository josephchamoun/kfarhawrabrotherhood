import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsersPage from "../pages/UsersPage";
import HomePage from "../pages/HomePage";
import EventsPage from "../pages/EventsPage";
import ShopsPage from "../pages/ShopsPage";
import LoginPage from "../pages/LoginPage";
import ChabibaPage from "../pages/ChabibaPage";
import ForsanPage from "../pages/ForsanPage";
import Tala2e3Page from "../pages/Tala2e3Page";
import UserProfilePage from "../pages/UserProfilePage";
import MyProfilePage from "../pages/MyProfilePage";
import ContactsPage from "../pages/ContactsPage";

import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserProfilePage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/shops" element={<ShopsPage />} />
          <Route path="/chabiba" element={<ChabibaPage />} />
          <Route path="/forsan" element={<ForsanPage />} />
          <Route path="/tala2e3" element={<Tala2e3Page />} />
          <Route path="/contacts" element={<ContactsPage />} />
        </Route>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
