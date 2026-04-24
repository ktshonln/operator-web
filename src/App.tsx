import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Toaster from "./components/Toaster";
import TripDetails from "./components/TripDetails";
import Layout from "./components/layouts/Layout";
import AuthGuard from "./components/AuthGuard";
import BusDetails from "./pages/BusDetails";
import Buses from "./pages/Buses";
import DriverDetails from "./pages/DriverDetails";
import Drivers from "./pages/Drivers";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyPasswordReset from "./pages/VerifyPasswordReset";
import LoginMfa from "./pages/LoginMfa";
import NotFound from "./pages/NotFound";
import ProfileSettings from "./pages/ProfileSettings";
import RegisterPage from "./pages/Register";
import VerifyOrganizationContact from "./pages/VerifyOrganizationContact";
import RegisterSuccess from "./pages/RegisterSuccess";
import AdminActivation from "./pages/AdminActivation";
import AcceptInvite from "./pages/AcceptInvite";
import Reports from "./pages/Reports";
import SecuritySettings from "./pages/SecuritySettings";
import Settings from "./pages/Settings";
import TicketDetails from "./pages/TicketDetails";
import Ticketing from "./pages/Ticketing";
import TicketSaleHistory from "./pages/TicketSaleHistory";
import Trips from "./pages/Trips";
import Organizations from "./pages/Organizations";
import OrganizationDetails from "./pages/OrganizationDetails";
import CreateOrganization from "./pages/CreateOrganization";
import UserDetails from "./pages/UserDetails";
import RolesSettings from "./pages/RolesSettings";
import AppearanceSettings from "./pages/AppearanceSettings";
import Invitations from "./pages/Invitations";
import InvitationDetails from "./pages/InvitationDetails";

function App() {
  return (
    <div className="dark:bg-black min-h-svh">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/verify-password-reset"
            element={<VerifyPasswordReset />}
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/i" element={<AcceptInvite />} />
          <Route path="/login-mfa" element={<LoginMfa />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/register/verify"
            element={<VerifyOrganizationContact />}
          />
          <Route path="/register/success" element={<RegisterSuccess />} />
          <Route
            path="/activate/:activationToken"
            element={<AdminActivation />}
          />

          <Route path="/" element={<Layout />}>
            <Route
              path="home"
              element={
                <AuthGuard action="read" subject="Home">
                  <HomePage />
                </AuthGuard>
              }
            />
            <Route
              path="ticketing"
              element={
                <AuthGuard action="read" subject="Ticket">
                  <Ticketing />
                </AuthGuard>
              }
            />
            <Route
              path="ticketing/:ticketId"
              element={
                <AuthGuard action="read" subject="Ticket">
                  <TicketDetails />
                </AuthGuard>
              }
            />
            <Route
              path="ticketing/history"
              element={
                <AuthGuard action="read" subject="Ticket">
                  <TicketSaleHistory />
                </AuthGuard>
              }
            />
            <Route
              path="organizations"
              element={
                <AuthGuard action="read" subject="Organization">
                  <Organizations />
                </AuthGuard>
              }
            />
            <Route
              path="organizations/create"
              element={
                <AuthGuard action="create" subject="Organization">
                  <CreateOrganization />
                </AuthGuard>
              }
            />
            <Route
              path="organizations/:id"
              element={
                <AuthGuard action="read" subject="Organization">
                  <OrganizationDetails />
                </AuthGuard>
              }
            />
            <Route
              path="organizations/:id/edit"
              element={
                <AuthGuard action="update" subject="Organization">
                  <OrganizationDetails />
                </AuthGuard>
              }
            />
            <Route path="fleets">
              <Route
                index
                path="buses"
                element={
                  <AuthGuard action="read" subject="Bus">
                    <Buses />
                  </AuthGuard>
                }
              />
              <Route
                path="buses/:busId"
                element={
                  <AuthGuard action="read" subject="Bus">
                    <BusDetails />
                  </AuthGuard>
                }
              />
              <Route
                path="drivers"
                element={
                  <AuthGuard action="read" subject="Driver">
                    <Drivers />
                  </AuthGuard>
                }
              />
              <Route
                path="drivers/:driverId"
                element={
                  <AuthGuard action="read" subject="Driver">
                    <DriverDetails />
                  </AuthGuard>
                }
              />
            </Route>
            <Route
              path="trips"
              element={
                <AuthGuard action="read" subject="Trip">
                  <Trips />
                </AuthGuard>
              }
            />
            <Route
              path="trips/:tripId"
              element={
                <AuthGuard action="read" subject="Trip">
                  <TripDetails />
                </AuthGuard>
              }
            />
            <Route
              path="reports"
              element={
                <AuthGuard action="read" subject="Report">
                  <Reports />
                </AuthGuard>
              }
            />
            <Route
              path="settings"
              element={<Navigate to="/settings/profile" replace />}
            />
            <Route
              path="team"
              element={<Navigate to="/team/users" replace />}
            />
            <Route
              path="team/users"
              element={
                <AuthGuard action="read" subject="User">
                  <Settings />
                </AuthGuard>
              }
            />
            <Route
              path="team/user/:userId"
              element={
                <AuthGuard action="read" subject="User">
                  <UserDetails />
                </AuthGuard>
              }
            />
            <Route
              path="team/roles"
              element={
                <AuthGuard action="read" subject="Role">
                  <RolesSettings />
                </AuthGuard>
              }
            />
            <Route
              path="team/invitations"
              element={
                <AuthGuard action="invite" subject="User">
                  <Invitations />
                </AuthGuard>
              }
            />
            <Route
              path="team/invitations/:id"
              element={
                <AuthGuard action="invite" subject="User">
                  <InvitationDetails />
                </AuthGuard>
              }
            />
            <Route
              path="settings/profile"
              element={
                <AuthGuard action="read" subject="User">
                  <ProfileSettings />
                </AuthGuard>
              }
            />
            <Route
              path="settings/security"
              element={
                <AuthGuard action="read" subject="User">
                  <SecuritySettings />
                </AuthGuard>
              }
            />
            <Route
              path="settings/appearance"
              element={
                <AuthGuard action="read" subject="User">
                  <AppearanceSettings />
                </AuthGuard>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
