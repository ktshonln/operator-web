import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useToastStore } from "../stores/toastStore";
import useLogout from "./useLogout";

export interface LoggedInUser {
  id?: string;
  firstName: string;
  lastName: string;
  userType: string;
  exp?:number
}

const defaultUser: LoggedInUser = {
  id: "1",
  firstName: "defaultFirst",
  lastName: "defaultLast",
  userType: "agent",
};

const useUser = () => {
  const [user, setUser] = useState<LoggedInUser>(defaultUser);
  const [loading, setLoading] = useState(false);
  const logout = useLogout();
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem('userId')
    console.log("TOKEN", token);
    if (!token) {
      showToast("User not logged in", "error");
      return;
    }
    try {
      const decodedToken:LoggedInUser= jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp != undefined && decodedToken.exp < currentTime) {
        // Token is expired
        showToast("Token has expired", "warning");
        logout();
      }
      setUser({
        ...decodedToken,
        id: userId || ''
      });

      setLoading(false);
    } catch (error) {
      console.error("Error decoding token", error);
      showToast(`Login token error`, "error");
      setLoading(false);
    }
  }, []);
  return { user, loading };
};

 export default useUser;

 /*const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
 */