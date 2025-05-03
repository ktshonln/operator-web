import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

export interface User { // A general Admin, on branch main
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: string;
  role: string; // admin/agent or even agentManager
  branch: string;
  companyName: string;
  companyRegNo: string;
  companyAddress: string;
  companyContact: string;
}
const apiClient = new APIClient<User>("/users/auth/register");
const useRegister = () => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: apiClient.registerUser<User>,
    onSuccess: () => {
      showToast("Successfully registered", "success");
      navigate("/register/success");
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useRegister;
