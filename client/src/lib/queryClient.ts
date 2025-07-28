import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { safeLocalStorageGet, safeFetch } from "./browserUtils";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

interface RequestConfig {
  url: string;
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

export async function apiRequest(config: RequestConfig): Promise<any>;
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response>;
export async function apiRequest(
  configOrMethod: RequestConfig | string,
  url?: string,
  data?: unknown | undefined,
): Promise<any> {
  let method: string;
  let requestUrl: string;
  let body: any;
  let headers: Record<string, string> = {};
  
  if (typeof configOrMethod === 'string') {
    // Legacy API
    method = configOrMethod;
    requestUrl = url!;
    body = data ? JSON.stringify(data) : undefined;
    if (data) {
      headers["Content-Type"] = "application/json";
    }
  } else {
    // New config-based API
    const { url: configUrl, method: configMethod = 'GET', body: configBody, headers: configHeaders = {}, isFormData = false } = configOrMethod;
    method = configMethod;
    requestUrl = configUrl;
    body = configBody;
    headers = { ...configHeaders };
    
    if (!isFormData && configBody && typeof configBody === 'object') {
      body = JSON.stringify(configBody);
      headers["Content-Type"] = "application/json";
    }
  }

  // Add session token to headers using cross-browser safe method
  const sessionToken = safeLocalStorageGet('easy_eddy_session_token');
  if (sessionToken) {
    headers['x-session-token'] = sessionToken;
  }

  const res = await safeFetch(requestUrl, {
    method,
    headers,
    body,
  });

  await throwIfResNotOk(res);
  
  if (typeof configOrMethod === 'object') {
    return await res.json();
  }
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    // Add session token to headers using cross-browser safe method
    const sessionToken = safeLocalStorageGet('easy_eddy_session_token');
    if (sessionToken) {
      headers['x-session-token'] = sessionToken;
    }
    
    const res = await safeFetch(queryKey.join("/") as string, {
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
