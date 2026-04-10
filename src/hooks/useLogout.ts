import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

const apiClient = new APIClient("/auth/logout");

const useLogout = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();

  return useMutation<void, Error>({
    mutationFn: async () => {
      await apiClient.post({});
    },
    onSuccess: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_id_pending_2fa");
      localStorage.removeItem("user_id_pending_verification");
      showToast("Successfully logged out", "success");
      navigate("/login");
    },
    onError: (error) => {
      // Still clear local data even if server request fails
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_id_pending_2fa");
      localStorage.removeItem("user_id_pending_verification");
      showToast(error.message || "Logout completed", "error");
      navigate("/login");
    },
  });
};

export default useLogout;
