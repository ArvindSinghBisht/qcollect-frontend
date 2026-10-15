import axios from "axios";
import Cookies from "js-cookie";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fifff-production.up.railway.app";

/**
 * Public API client for endpoints that must never receive an existing JWT
 * or project header, such as login and registration.
 */
export const publicApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

function getSelectedProjectIdFromStorage(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("qcollect-auth-store");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed?.state?.selectedProjectId || null;
  } catch {
    return null;
  }
}

function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false;

  return (
    url.startsWith("/auth/login") ||
    url.startsWith("/auth/register")
  );
}

api.interceptors.request.use((config) => {
  const publicAuthRequest = isPublicAuthRequest(config.url);

  /*
   * Login/register must not receive a stale bearer token or project context.
   * Remove both headers explicitly in case Axios reused a headers object.
   */
  if (publicAuthRequest) {
    if (typeof (config.headers as any)?.delete === "function") {
      (config.headers as any).delete("Authorization");
      (config.headers as any).delete("X-Project-Id");
    } else {
      if (config.headers) {
        delete (config.headers as any).Authorization;
        delete (config.headers as any)["X-Project-Id"];
      }
    }

    return config;
  }

  const token = Cookies.get("token");
  const selectedProjectId = getSelectedProjectIdFromStorage();

  if (token) {
    if (typeof (config.headers as any)?.set === "function") {
      (config.headers as any).set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      } as any;
    }
  }

  if (selectedProjectId) {
    if (typeof (config.headers as any)?.set === "function") {
      (config.headers as any).set("X-Project-Id", selectedProjectId);
    } else {
      config.headers = {
        ...(config.headers || {}),
        "X-Project-Id": selectedProjectId,
      } as any;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url as string | undefined;
    const isLoginOrRegister = isPublicAuthRequest(requestUrl);

    /*
     * Do not redirect the login page back to itself for invalid credentials.
     * Protected API calls can still clear the expired session on 401.
     */
    if (error.response?.status === 401 && !isLoginOrRegister) {
      Cookies.remove("token", { path: "/" });

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("qcollect-auth-store");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
