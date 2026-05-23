import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "../stores/toastStore";
import { axiosInstance } from "../services/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateLocationPayload {
  name: string;
  province: string;
  lat: number;
  lng: number;
}

export interface UpdateLocationPayload {
  name?: string;
  province?: string;
  lat?: number;
  lng?: number;
}

export interface LocationsListResponse {
  data: Location[];
  total: number;
  page: number;
  limit: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const RWANDA_PROVINCES = [
  "Northern Province",
  "Southern Province",
  "Eastern Province",
  "Western Province",
  "Kigali City",
] as const;

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useLocationsList = (params?: {
  q?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["locations", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<LocationsListResponse>(
        "/locations",
        { params }
      );
      return data;
    },
  });
};

export const useLocationById = (id: string) => {
  return useQuery({
    queryKey: ["locations", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Location>(`/locations/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLocationPayload) => {
      const { data } = await axiosInstance.post<Location>("/locations", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    // NOTE: 409 LOCATION_ALREADY_EXISTS is NOT caught here — it propagates
    // to the calling component for inline error display.
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLocationPayload }) => {
      const { data: updated } = await axiosInstance.patch<Location>(
        `/locations/${id}`,
        data
      );
      return updated;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      queryClient.invalidateQueries({ queryKey: ["locations", id] });
    },
    // NOTE: 409 LOCATION_ALREADY_EXISTS propagates to calling component.
  });
};

export const useDeleteLocation = () => {
  const showToast = useToastStore((s) => s.showToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/locations/${id}`);
    },
    onSuccess: () => {
      showToast("Location deleted", "success");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (error: any) => {
      const code = error?.response?.data?.error?.code;
      if (code === "LOCATION_IN_USE") {
        const msg =
          error?.response?.data?.error?.message ||
          "This location is used by one or more routes and cannot be deleted";
        showToast(msg, "error");
      }
      // Other errors bubble up silently (caller can handle if needed)
    },
  });
};
