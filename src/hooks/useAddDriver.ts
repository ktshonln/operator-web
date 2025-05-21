import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import APIClient from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { Driver } from "./useDrivers";

export interface DriverDetails {
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  assignedBusId: string;
}

const apiClient = new APIClient<Driver>("/companies");
const useAddDriver = (companyId: string) => {
  const showToast = useToastStore((state) => state.showToast);
  const navigate = useNavigate();
  return useMutation<Driver, Error, DriverDetails>({
    mutationFn: (driverDetails: DriverDetails) =>
      apiClient.addDriver<DriverDetails>(driverDetails, companyId),
    onSuccess: (savedData) => {
      showToast("Successfully added a new driver!", "success");
      navigate(`/fleets/drivers/${savedData.driverId}`);
    },
    onError: (error) => showToast(error.message, "error"),
  });
};

export default useAddDriver;
