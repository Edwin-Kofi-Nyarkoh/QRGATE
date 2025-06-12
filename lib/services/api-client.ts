import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiClientError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

let clientInstance: AxiosInstance | null = null;

function createApiClient(config: ApiClientConfig = {}): AxiosInstance {
  if (clientInstance) {
    return clientInstance;
  }

  const { baseURL = "/api", timeout = 10000 } = config;

  clientInstance = axios.create({
    baseURL,
    timeout,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor for auth
  clientInstance.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  clientInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        if (typeof window !== "undefined") {
          window.location.href = "/auth/signin";
        }
      }

      const apiError = new ApiClientError(
        error.response?.data?.message || error.message || "An error occurred",
        error.response?.status,
        error.response?.data?.code
      );

      return Promise.reject(apiError);
    }
  );

  return clientInstance;
}

function getClient(): AxiosInstance {
  if (!clientInstance) {
    return createApiClient();
  }
  return clientInstance;
}

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const client = getClient();
  const response = await client.get<T>(url, config);
  return response.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const client = getClient();
  const response = await client.post<T>(url, data, config);
  return response.data;
}

export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const client = getClient();
  const response = await client.put<T>(url, data, config);
  return response.data;
}

export async function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const client = getClient();
  const response = await client.patch<T>(url, data, config);
  return response.data;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const client = getClient();
  const response = await client.delete<T>(url, config);
  return response.data;
}

// Initialize the client
export const initializeApiClient = (config?: ApiClientConfig) => {
  createApiClient(config);
};

// Export error class for error handling
export { ApiClientError };
export type { ApiError };
