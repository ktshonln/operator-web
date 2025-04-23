import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface LogoutDetails {
  token: string;
}

interface logoutResponse {
  status: string;
  message: string;
}

const apiClient = new APIClient<logoutResponse>("/users/auth/logout");
const useLogout = () => {
  console.log("clickeddd");
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  const { mutate } = useMutation<logoutResponse, Error>({
    mutationFn: () => {
      const token = localStorage.getItem("token") || "";
      return apiClient.post<LogoutDetails>({ token: token });
    },
    onSuccess: () => {
      localStorage.removeItem("token");
      showToast("Successfully logged out", "success");
      navigate("/login");
    },
    onError: (error) => showToast(error.message, "error"),
  });
  return mutate;
};

export default useLogout;
