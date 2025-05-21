import axios, { AxiosRequestConfig } from "axios";
import { baseUrl } from "../mocks/handlers/utils";

const axiosInstance = axios.create({
  baseURL: baseUrl, //"https://e2689ec1-a734-4f3a-80dd-77f1a45ef528.mock.pstmn.io",
});

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

  post = <TRequest>(input: TRequest) => {
    return axiosInstance
      .post<TResponse>(this.endpoint, input)
      .then((res) => res.data);
  };
  put = <TRequest>(input: TRequest,id: string | number) => {
    return axiosInstance
      .put<TResponse>(`${this.endpoint}/${id}`, input)
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
  addBus = <TRequest>(input: TRequest,companyId: string | number) => {
    return axiosInstance
      .post<TResponse>(`${this.endpoint}/${companyId}/buses`, input)
      .then((res) => res.data);
  };
  editBus = <TRequest>(input: TRequest,companyId: string | number, busId: string | number) => {
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
  addDriver = <TRequest>(input: TRequest,companyId: string | number) => {
    return axiosInstance
      .post<TResponse>(`${this.endpoint}/${companyId}/drivers`, input)
      .then((res) => res.data);
  };
  editDriver = <TRequest>(input: TRequest,companyId: string | number, driverId: string | number) => {
    return axiosInstance
      .put<TResponse>(`${this.endpoint}/${companyId}/drivers/${driverId}`, input)
      .then((res) => res.data);
  };
  deleteDriver = (companyId: string | number, driverId: string | number) => {
    return axiosInstance
      .delete<TResponse>(`${this.endpoint}/${companyId}/drivers/${driverId}`)
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
    addRoute = <TRequest>(input: TRequest,companyId: string | number) => {
    return axiosInstance
      .post<TResponse>(`${this.endpoint}/${companyId}/routes`, input)
      .then((res) => res.data);
  };
  editRoute = <TRequest>(input: TRequest,companyId: string | number, routeId: string | number) => {
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
    config: AxiosRequestConfig
  ) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/analytics/revenue`, config)
      .then((res) => res.data);
  };
  getPopularRoutes = (
    companyId: string | number,
    config: AxiosRequestConfig
  ) => {
    return axiosInstance
      .get<TResponse>(
        `${this.endpoint}/${companyId}/analytics/popular-routes`,
        config
      )
      .then((res) => res.data);
  };
  getPeakTimes = (companyId: string | number, config: AxiosRequestConfig) => {
    return axiosInstance
      .get<TResponse>(
        `${this.endpoint}/${companyId}/analytics/peak-times`,
        config
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
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          // Server responded with a message
          throw new Error(error.response.data.message);
        } else {
          throw new Error(error.message);
        }
      });
  };
}

export default APIClient;
