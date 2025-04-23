import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layouts/LayoutOne";
import Buses from "./pages/Buses";
import Drivers from "./pages/Drivers";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/Register";
import Ticketing from "./pages/Ticketing";
import TicketDetails from "./pages/TicketDetails";
import TicketSaleHistory from "./pages/TicketSaleHistory";
import BusDetails from "./pages/BusDetails";
import DriverDetails from "./pages/DriverDetails";
import Trips from "./pages/Trips";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ProfileSettings from "./pages/ProfileSettings";
import UserDetails from "./pages/UserDetails";
import SecuritySettings from "./pages/SecuritySettings";
import RegisterSuccess from "./pages/RegisterSuccess";
import LoginMfa from "./pages/LoginMfa";
import Toaster from "./components/Toaster";
import { useState } from "react";

function App() {
  const [show, setShow] = useState(true);
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login-mfa" element={<LoginMfa />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/success" element={<RegisterSuccess />} />

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
