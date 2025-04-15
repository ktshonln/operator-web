import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./layouts/LayoutOne";
import Buses from "./pages/Buses";
import Drivers from "./pages/Drivers";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/Register";

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
