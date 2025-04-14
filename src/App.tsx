import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Fleets from "./pages/Fleets";
import Buses from "./pages/Buses";
import Layout from "./layouts/LayoutOne";
import NotFound from "./pages/NotFound";
import Drivers from "./pages/Drivers";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path={"/"}>
            <Route index element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path={"/"} element={<Layout/>}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/fleets">
                <Route index path="buses" element={<Buses/>} />
                <Route path="drivers" element={<Drivers/>} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
