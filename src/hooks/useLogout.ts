import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

interface LogoutResponse {
  status: string;
  message: string;
}

const apiClient = new APIClient<LogoutResponse>("/auth/logout");
const useLogout = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  const { mutate } = useMutation<LogoutResponse, Error>({
    mutationFn: () => apiClient.post<unknown>({}),
    onSuccess: () => {
      localStorage.removeItem("user");
      showToast("Successfully logged out", "success");
      navigate("/login");
    },
    onError: (error) => showToast(error.message, "error"),
  });
  return mutate;
};

export default useLogout;
