export function unwrapApiData<T>(response: unknown, fallback: T): T {
  if (!response || typeof response !== "object") return fallback;

  const value = response as { data?: unknown };

  if (Array.isArray(value.data)) return value.data as T;
  if (value.data !== undefined && value.data !== null) return value.data as T;
  if (Array.isArray(response)) return response as T;

  return response as T;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (!error || typeof error !== "object") return fallback;

  const axiosError = error as {
    response?: { data?: { message?: string; error?: string } };
    message?: string;
  };

  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    axiosError.message ||
    fallback
  );
}
