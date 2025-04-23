import axios, { AxiosRequestConfig } from "axios";
import { baseUrl } from "../mocks/handlers";

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

  getAnalytics = (companyId: string | number, config: AxiosRequestConfig) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/analytics`, config)
      .then((res) => res.data);
  };
  getRevenueAnalytics = (companyId: string | number, config: AxiosRequestConfig) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/analytics/revenue`, config)
      .then((res) => res.data);
  };
  getPopularRoutes = (companyId: string | number, config: AxiosRequestConfig) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/analytics/popular-routes`, config)
      .then((res) => res.data);
  };
  getPeakTimes = (companyId: string | number, config: AxiosRequestConfig) => {
    return axiosInstance
      .get<TResponse>(`${this.endpoint}/${companyId}/analytics/peak-times`, config)
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
      .then((res) => res.data).catch((error)=>{
        if (error.response && error.response.data && error.response.data.message) {
          // Server responded with a message
          throw new Error(error.response.data.message);
        }
        else {
          throw new Error(error.message)
        }
      });
  };
}

export default APIClient;
