import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface LoginDetails {
  identifier: string;
  password: string;
  device_name?: string;
}

export interface LoginUser {
  id: string;
  firstName: string;
  lastName: string;
  userType: string;
  companyId: string;
  role: string;
  branch: string;
}

export interface LoginResponse {
  user: LoginUser;
}

const apiClient = new APIClient<LoginResponse>("/auth/login");
const useLogin = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<LoginResponse, Error, LoginDetails>({
    mutationFn: apiClient.loginUser<LoginDetails>,
    onSuccess: (savedData) => {
      localStorage.setItem("user", JSON.stringify(savedData.user));
      showToast("Successfully logged in", "success");
      navigate("/home");
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useLogin;
