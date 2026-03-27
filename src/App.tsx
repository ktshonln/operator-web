import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Toaster from "./components/Toaster";
import TripDetails from "./components/TripDetails";
import BusDetails from "./pages/BusDetails";
import Buses from "./pages/Buses";
import DriverDetails from "./pages/DriverDetails";
import Drivers from "./pages/Drivers";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import LoginMfa from "./pages/LoginMfa";
import NotFound from "./pages/NotFound";
import ProfileSettings from "./pages/ProfileSettings";
import RegisterPage from "./pages/Register";
import RegisterSuccess from "./pages/RegisterSuccess";
import AdminActivation from "./pages/AdminActivation";
import Reports from "./pages/Reports";
import SecuritySettings from "./pages/SecuritySettings";
import Settings from "./pages/Settings";
import TicketDetails from "./pages/TicketDetails";
import Ticketing from "./pages/Ticketing";
import TicketSaleHistory from "./pages/TicketSaleHistory";
import Trips from "./pages/Trips";
import UserDetails from "./pages/UserDetails";
import Layout from "./components/layouts/Layout";

function App() {
  return (
    <div className="dark:bg-black min-h-svh">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/login-mfa" element={<LoginMfa />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/success" element={<RegisterSuccess />} />
          <Route
            path="/activate/:activationToken"
            element={<AdminActivation />}
          />

          <Route path="/" element={<Layout />}>
            <Route path="home" element={<HomePage />} />
            <Route path="ticketing" element={<Ticketing />} />
            <Route path="ticketing/:ticketId" element={<TicketDetails />} />
            <Route path="ticketing/history" element={<TicketSaleHistory />} />
            <Route path="fleets">
              <Route index path="buses" element={<Buses />} />
              <Route path="buses/:busId" element={<BusDetails />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="drivers/:driverId" element={<DriverDetails />} />
            </Route>
            <Route path="trips" element={<Trips />} />
            <Route path="trips/:tripId" element={<TripDetails />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="settings/user/:userId" element={<UserDetails />} />
            <Route path="settings/profile" element={<ProfileSettings />} />
            <Route path="settings/security" element={<SecuritySettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
