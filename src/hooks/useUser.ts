import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useToastStore } from "../stores/toastStore";
import useLogout from "./useLogout";
import { useNavigate } from "react-router-dom";

export const userRoles = ['admin', 'agent', "agentManager"] as const; 
export type Role = typeof userRoles[number];
export interface LoggedInUser { // The JWT data
  id?: string;
  firstName: string;
  lastName: string;
  userType: string;
  companyId: string;
  role: Role;
  branch:string; // An agent needs one but for an admin it is not necessary this could default to 'main'
  exp?:number
}

const useUser = () => {
  const [user, setUser] = useState<LoggedInUser>({} as LoggedInUser);
  const [loading, setLoading] = useState(false);
  const logout = useLogout();
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem('userId')
    console.log("TOKEN", token);
    if (!token) {
      showToast("User not logged in", "error");
      navigate('/login')
      return;
    }
    try {
      const decodedToken:LoggedInUser= jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp != undefined && decodedToken.exp < currentTime) {
        // Token is expired
        showToast("Your session has expired", "warning");
        logout();
        localStorage.setItem('token','')
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
