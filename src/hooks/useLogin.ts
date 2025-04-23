import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface LoginDetails {
  email: string;
  password: string;
}

export interface loginResponse {
  token: string;
  userId: string;
}

const apiClient = new APIClient<loginResponse>("/users/auth/login");
const useLogin = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<loginResponse, Error ,LoginDetails>({
    mutationFn: apiClient.loginUser<LoginDetails>,
    onSuccess: (savedData) => {
      localStorage.setItem('userId', savedData.userId)
      localStorage.setItem("token", savedData.token);
      showToast("Successfully logged in", "success");
      navigate("/home");
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useLogin;
