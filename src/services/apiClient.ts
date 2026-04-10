import axios, { AxiosRequestConfig, AxiosError } from "axios";

export const baseUrl = import.meta.env.VITE_API_URL || "/api/v1";

export const axiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

// Add response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Skip interceptor for auth endpoints (login, refresh, etc.)
    if (originalRequest?.url?.includes("/auth/")) {
      return Promise.reject(error);
    }

    // Check if error is 401 and not already a refresh attempt
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint
        const response = await axiosInstance.post("/auth/refresh", {});
        const { tokens, user } = response.data;

        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("refresh_token", tokens.refresh_token);
        localStorage.setItem("user", JSON.stringify(user));

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${tokens.access_token}`;
        originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;

        processQueue(null, tokens.access_token);
        return axiosInstance(originalRequest);
      } catch (err) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        processQueue(err);
        // Redirect to login - note: in a real app you'd use React Router's navigate
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

// Helper function to extract error message from axios error
const extractErrorMessage = (error: any): string => {
  if (error.response && error.response.data) {
    // Check for nested error structure first (like { error: { message: "..." } })
    if (error.response.data.error && error.response.data.error.message) {
      return error.response.data.error.message;
    }
    // Check for direct message
    else if (error.response.data.message) {
      return error.response.data.message;
    }
  }
  // Fallback to axios default message or generic message
  return error.message || "An error occurred";
};

class APIClient<TResponse> {
  endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }
  getAll = (config: AxiosRequestConfig) => {
    return axiosInstance
      .get<TResponse>(this.endpoint, config)
      .then((res) => res.data);
  };

  get = (id: string | number, config?: AxiosRequestConfig) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${id}`, config)
      .then((res) => res.data);
  };

  post = <TRequest>(input: TRequest, customEndpoint?: string) => {
    const endpoint = customEndpoint || this.endpoint;
    return axiosInstance
      .post<TResponse>(endpoint, input)
      .then((res) => res.data);
  };
  put = <TRequest>(input: TRequest, id: string | number) => {
    return axiosInstance
      .put<TResponse>(`${this.endpoint}/${id}`, input)
      .then((res) => res.data);
  };
  patch = <TRequest>(input: TRequest, id: string | number) => {
    return axiosInstance
      .patch<TResponse>(`${this.endpoint}/${id}`, input)
      .then((res) => res.data);
  };
  delete = (id: string | number) => {
    return axiosInstance
      .delete<TResponse>(`${this.endpoint}/${id}`)
      .then((res) => res.data);
  };

  getAllAgents = (companyId: string | number, config: AxiosRequestConfig) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/agents`, config)
      .then((res) => res.data);
  };
  getAgent = (companyId: string | number, agentId: string | number) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/agents/${agentId}`)
      .then((res) => res.data);
  };
  addAgent = <TRequest>(input: TRequest, companyId: string | number) => {
    return axiosInstance
      .post<TResponse>(`${this.endpoint}/${companyId}/agents`, input)
      .then((res) => res.data);
  };
  getBus = (companyId: string | number, busId: string | number) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/buses/${busId}`)
      .then((res) => res.data);
  };
  getAllBuses = (companyId: string | number, config: AxiosRequestConfig) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/buses`, config)
      .then((res) => res.data);
  };
  addBus = <TRequest>(input: TRequest, companyId: string | number) => {
    return axiosInstance
      .post<TResponse>(`${this.endpoint}/${companyId}/buses`, input)
      .then((res) => res.data);
  };
  editBus = <TRequest>(
    input: TRequest,
    companyId: string | number,
    busId: string | number,
  ) => {
    return axiosInstance
      .put<TResponse>(`${this.endpoint}/${companyId}/buses/${busId}`, input)
      .then((res) => res.data);
  };
  deleteBus = (companyId: string | number, busId: string | number) => {
    return axiosInstance
      .delete<TResponse>(`${this.endpoint}/${companyId}/buses/${busId}`)
      .then((res) => res.data);
  };
  getDriver = (companyId: string | number, driverId: string | number) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/drivers/${driverId}`)
      .then((res) => res.data);
  };
  getAllDrivers = (companyId: string | number, config: AxiosRequestConfig) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/drivers`, config)
      .then((res) => res.data);
  };
  addDriver = <TRequest>(input: TRequest, companyId: string | number) => {
    return axiosInstance
      .post<TResponse>(`${this.endpoint}/${companyId}/drivers`, input)
      .then((res) => res.data);
  };
  editDriver = <TRequest>(
    input: TRequest,
    companyId: string | number,
    driverId: string | number,
  ) => {
    return axiosInstance
      .put<TResponse>(
        `${this.endpoint}/${companyId}/drivers/${driverId}`,
        input,
      )
      .then((res) => res.data);
  };
  deleteDriver = (companyId: string | number, driverId: string | number) => {
    return axiosInstance
      .delete<TResponse>(`${this.endpoint}/${companyId}/drivers/${driverId}`)
      .then((res) => res.data);
  };
  addTrip = <TRequest>(input: TRequest, companyId: string | number) => {
    return axiosInstance
      .post<TResponse>(`${this.endpoint}/${companyId}/trips`, input)
      .then((res) => res.data);
  };
  editTrip = <TRequest>(
    input: TRequest,
    companyId: string | number,
    tripId: string | number,
  ) => {
    return axiosInstance
      .put<TResponse>(`${this.endpoint}/${companyId}/trips/${tripId}`, input)
      .then((res) => res.data);
  };
  deleteTrip = (companyId: string | number, tripId: string | number) => {
    return axiosInstance
      .delete<TResponse>(`${this.endpoint}/${companyId}/trips/${tripId}`)
      .then((res) => res.data);
  };
  getRoute = (companyId: string | number, busId: string | number) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/routes/${busId}`)
      .then((res) => res.data);
  };
  getAllRoutes = (companyId: string | number, config: AxiosRequestConfig) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/routes`, config)
      .then((res) => res.data);
  };
  addRoute = <TRequest>(input: TRequest, companyId: string | number) => {
    return axiosInstance
      .post<TResponse>(`${this.endpoint}/${companyId}/routes`, input)
      .then((res) => res.data);
  };
  editRoute = <TRequest>(
    input: TRequest,
    companyId: string | number,
    routeId: string | number,
  ) => {
    return axiosInstance
      .put<TResponse>(`${this.endpoint}/${companyId}/routes/${routeId}`, input)
      .then((res) => res.data);
  };
  deleteRoute = (companyId: string | number, routeId: string | number) => {
    return axiosInstance
      .delete<TResponse>(`${this.endpoint}/${companyId}/routes/${routeId}`)
      .then((res) => res.data);
  };
  getManifest = (companyId: string | number, tripId: string | number) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/trips/${tripId}/manifest`)
      .then((res) => res.data);
  };

  getAnalytics = (companyId: string | number, config: AxiosRequestConfig) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/analytics`, config)
      .then((res) => res.data);
  };
  getRevenueAnalytics = (
    companyId: string | number,
    config: AxiosRequestConfig,
  ) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/analytics/revenue`, config)
      .then((res) => res.data);
  };
  getPopularRoutes = (
    companyId: string | number,
    config: AxiosRequestConfig,
  ) => {
    return axiosInstance
      .get<TResponse>(
        `${this.endpoint}/${companyId}/analytics/popular-routes`,
        config,
      )
      .then((res) => res.data);
  };
  getPeakTimes = (companyId: string | number, config: AxiosRequestConfig) => {
    return axiosInstance
      .get<TResponse>(
        `${this.endpoint}/${companyId}/analytics/peak-times`,
        config,
      )
      .then((res) => res.data);
  };

  registerUser = <TRequest>(userData: TRequest) => {
    return axiosInstance
      .post<TResponse>(this.endpoint, userData)
      .then((res) => res.data);
  };
  loginUser = async <TRequest>(userData: TRequest) => {
    return axiosInstance
      .post<TResponse>(this.endpoint, userData)
      .then((res) => res.data)
      .catch((error) => {
        throw new Error(extractErrorMessage(error));
      });
  };

  getPresignedUploadUrl = async (fileName: string, contentType: string) => {
    return axiosInstance
      .post<{
        uploadUrl: string;
        fileUrl: string;
      }>("/api/v1/uploads/presigned-url", {
        file_name: fileName,
        content_type: contentType,
      })
      .then((res) => res.data);
  };

  uploadFileToUrl = async (uploadUrl: string, file: File) => {
    return axios
      .create({ baseURL: "" })
      .put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
      })
      .then((res) => res.data);
  };
}

export default APIClient;
