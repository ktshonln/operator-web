import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../services/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PriceStop {
  id: string;
  name: string;
}

export interface Price {
  id: string;
  boarding_stop: PriceStop;
  alighting_stop: PriceStop;
  amount: number;
  currency: string;
}

export interface PricesListResponse {
  data: Price[];
  total: number;
  page: number;
  limit: number;
}

export interface UpsertPricePayload {
  boarding_stop_id: string;
  alighting_stop_id: string;
  amount: number;
  currency: string;
}

// ─── Query key ────────────────────────────────────────────────────────────────

const PRICES_KEY = "prices";

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const usePricesList = (params?: {
  boarding_stop_id?: string;
  alighting_stop_id?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [PRICES_KEY, params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PricesListResponse>("/prices", { params });
      return data;
    },
  });
};

export const useUpsertPrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertPricePayload) => {
      const { data } = await axiosInstance.put<Price>("/prices", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRICES_KEY] });
    },
    // 422 INVALID_STOP_PAIR propagates to caller
  });
};

export const useDeletePrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/prices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRICES_KEY] });
    },
  });
};
