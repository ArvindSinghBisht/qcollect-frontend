import Cookies from "js-cookie";
import { publicApi } from "./api";
import type { ApiResponse, LoginRequest, LoginResponse } from "@/types/auth";

export async function login(
  request: LoginRequest
): Promise<LoginResponse> {
  /*
   * Remove any stale token before login. The public API client also guarantees
   * that Authorization and X-Project-Id are not sent to /auth/login.
   */
  Cookies.remove("token", { path: "/" });

  const response = await publicApi.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    request
  );

  if (!response.data.success || !response.data.data?.accessToken) {
    throw new Error(response.data.message || "Login failed");
  }

  return response.data.data;
}
